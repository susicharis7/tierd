import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  githubActivityRepository,
  type GithubContributionDay,
} from "../../repositories/githubActivityRepository";

const STALE_MS = 60_000;

export type GithubActivityCell = {
  /** Local YYYY-MM-DD for this cell. */
  date: string;
  contributions: number;
  /** Cell falls past today — renders as a placeholder, not a "0 contribs" tile. */
  inFuture: boolean;
};

export type GithubActivityResult = {
  /** weeks[week][dayOfWeek]: Mon=0 .. Sun=6. 53 columns. */
  weeks: GithubActivityCell[][];
  totalContributions: number;
  activeDays: number;
  /** Consecutive trailing days (ending today or yesterday) with contributions > 0. */
  currentStreak: number;
  /** The most recent 7-day slice (Mon..Sun of the current week), zero-padded. */
  lastWeek: number[];
  /** No contribution rows at all for this profile. */
  isEmpty: boolean;
};

/** Local YYYY-MM-DD without timezone surprises from `Date#toISOString`. */
function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildResult(rows: GithubContributionDay[]): GithubActivityResult {
  const byDate = new Map<string, number>();
  for (const r of rows) byDate.set(r.day, r.contributions);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // JS getDay: 0=Sun, 1=Mon, ..., 6=Sat. Convert to Mon=0..Sun=6 so the grid
  // matches the M-T-W-T-F-S-S column labels the rest of the app already uses.
  const todayDow = (today.getDay() + 6) % 7;

  // Start of the leftmost column: 52 weeks before the Monday of the current
  // week. That yields a 53-column grid where the rightmost column is the
  // current (possibly partial) week.
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - todayDow - 52 * 7);

  const weeks: GithubActivityCell[][] = [];
  let totalContributions = 0;
  let activeDays = 0;

  for (let w = 0; w < 53; w++) {
    const week: GithubActivityCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(gridStart);
      cell.setDate(gridStart.getDate() + w * 7 + d);
      const iso = toLocalISODate(cell);
      const inFuture = cell.getTime() > today.getTime();
      const contributions = byDate.get(iso) ?? 0;

      if (!inFuture) {
        totalContributions += contributions;
        if (contributions > 0) activeDays += 1;
      }

      week.push({ date: iso, contributions, inFuture });
    }
    weeks.push(week);
  }

  // Current streak: walk backwards from today (or yesterday, if today is still
  // zero — GitHub's own UI is lenient that way) and count consecutive days
  // with at least one contribution.
  let currentStreak = 0;
  const cursor = new Date(today);
  if ((byDate.get(toLocalISODate(cursor)) ?? 0) === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const v = byDate.get(toLocalISODate(cursor)) ?? 0;
    if (v <= 0) break;
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
    // Safety bound — the view caps at 364 days anyway.
    if (currentStreak > 400) break;
  }

  // Last week slice = the rightmost column, padded for any future days.
  const lastWeek = weeks[weeks.length - 1].map((c) =>
    c.inFuture ? 0 : c.contributions,
  );

  return {
    weeks,
    totalContributions,
    activeDays,
    currentStreak,
    lastWeek,
    isEmpty: rows.length === 0,
  };
}

export const githubActivityKeys = {
  byProfile: (profileId: string | null) =>
    ["github-activity", "by-profile", profileId] as const,
};

/**
 * Loads + reshapes a profile's last-52-weeks GitHub contribution grid for
 * rendering the year heatmap and the "this week" mini-chart.
 *
 * Returns a stable empty result while `profileId` is null so callers can
 * pass it conditionally without juggling undefined.
 */
export function useGithubActivity(profileId: string | null | undefined) {
  const query = useQuery({
    queryKey: githubActivityKeys.byProfile(profileId ?? null),
    queryFn: () => githubActivityRepository.listLast52Weeks(profileId!),
    enabled: Boolean(profileId),
    staleTime: STALE_MS,
  });

  const reshaped = useMemo(() => {
    if (!query.data) return null;
    return buildResult(query.data);
  }, [query.data]);

  return {
    data: reshaped,
    loading: query.isLoading,
    error: query.error,
  };
}
