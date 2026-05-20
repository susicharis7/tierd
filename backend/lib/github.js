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
    // GitHub returns errors with a 200 status for query problems — treat
    // BAD_CREDENTIALS as a token issue, everything else as a hard failure.
    if (/bad credentials/i.test(msg)) {
      throw new GitHubTokenInvalidError(msg);
    }
    throw new Error(`GitHub GraphQL error: ${msg}`);
  }

  const calendar =
    payload.data?.viewer?.contributionsCollection?.contributionCalendar;
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
    login: payload.data.viewer.login ?? null,
    totalContributions: calendar.totalContributions ?? 0,
    days,
  };
}

module.exports = {
  fetchViewerContributionDays,
  GitHubTokenInvalidError,
};
