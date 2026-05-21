const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

/**
 * Thrown when GitHub rejects our token (revoked, expired, or scope-stripped).
 * The route handler maps this to a 401 so the frontend can prompt a re-link.
 */
class GitHubTokenInvalidError extends Error {
  constructor(message) {
    super(message);
    this.name = "GitHubTokenInvalidError";
  }
}

/**
 * Low-level GraphQL caller — handles 401 / non-200 / inline payload.errors.
 * The two viewer queries we use both go through this so the error-handling
 * stays consistent (and a future third query gets it for free).
 */
async function runGraphQL(accessToken, query) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "tierd-sync",
    },
    body: JSON.stringify({ query }),
  });

  if (response.status === 401) {
    throw new GitHubTokenInvalidError("GitHub rejected the access token.");
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub GraphQL returned ${response.status}: ${body}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    const msg = payload.errors.map((e) => e.message).join("; ");
    // GitHub returns 200 for query-level errors; map BAD_CREDENTIALS to
    // the same revoked-token signal we get from HTTP 401.
    if (/bad credentials/i.test(msg)) {
      throw new GitHubTokenInvalidError(msg);
    }
    throw new Error(`GitHub GraphQL error: ${msg}`);
  }

  return payload.data;
}

/**
 * Fetches the signed-in viewer's contribution calendar for the last 52 weeks.
 * Returns the flat list of { date, contributionCount } days — GitHub's GraphQL
 * groups them by week which is annoying to consume, so we flatten here.
 */
async function fetchViewerContributionDays(accessToken) {
  const query = `
    query ViewerContributions {
      viewer {
        login
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const data = await runGraphQL(accessToken, query);
  const calendar = data?.viewer?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("GitHub GraphQL returned no contributionCalendar.");
  }

  const days = [];
  for (const week of calendar.weeks ?? []) {
    for (const day of week.contributionDays ?? []) {
      days.push({
        date: day.date,
        contributionCount: day.contributionCount ?? 0,
      });
    }
  }

  return {
    login: data.viewer.login ?? null,
    totalContributions: calendar.totalContributions ?? 0,
    days,
  };
}

/**
 * Fetches the viewer's top languages by aggregated byte-size across their
 * first 100 owner-affiliated, non-fork repositories. Excluding forks is
 * important — forks would otherwise dominate the totals with code the user
 * didn't actually write.
 *
 * Returns the top `limit` languages descending by byte count, each with the
 * official GitHub color (handy for future UI accents).
 */
async function fetchViewerTopLanguages(accessToken, limit = 5) {
  const query = `
    query ViewerTopLanguages {
      viewer {
        repositories(
          first: 100
          ownerAffiliations: OWNER
          isFork: false
          orderBy: { field: PUSHED_AT, direction: DESC }
        ) {
          nodes {
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
      }
    }
  `;

  const data = await runGraphQL(accessToken, query);
  const repos = data?.viewer?.repositories?.nodes ?? [];

  const totals = new Map(); // name -> { size, color }
  for (const repo of repos) {
    for (const edge of repo?.languages?.edges ?? []) {
      const name = edge?.node?.name;
      if (!name) continue;
      const prev = totals.get(name) ?? { size: 0, color: edge.node.color ?? null };
      prev.size += edge.size ?? 0;
      // Prefer a non-null color if we've seen one for this language.
      if (!prev.color && edge.node.color) prev.color = edge.node.color;
      totals.set(name, prev);
    }
  }

  return [...totals.entries()]
    .map(([name, v]) => ({ name, size: v.size, color: v.color }))
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}

module.exports = {
  fetchViewerContributionDays,
  fetchViewerTopLanguages,
  GitHubTokenInvalidError,
};
