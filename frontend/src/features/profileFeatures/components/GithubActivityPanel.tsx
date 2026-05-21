import { useMemo } from "react";
import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { useGithubActivity, type GithubActivityCell } from "../useGithubActivity";

interface GithubActivityPanelProps {
  /** Profile being rendered (may be the signed-in user or someone else). */
  profileId: string | null | undefined;
  /** Used to decide which empty-state copy to show. */
  isOwnProfile: boolean;
  /** True when the viewed profile has linked GitHub (only meaningful for own profile). */
  isLinked: boolean;
  /** Optional callback so the "Connect GitHub" CTA can scroll/focus the link section. */
  onPromptLink?: () => void;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

/**
 * Maps a single day's contribution count to one of 5 intensity tiers. The
 * thresholds intentionally match GitHub's own heatmap (1-3, 4-6, 7-9, 10+)
 * so the visual reads identically to what users already expect.
 */
function intensityClass(count: number, inFuture: boolean): string {
  if (inFuture) return "bg-cream/[0.025] border-cream/[0.04]";
  if (count <= 0) return "bg-cream/[0.06] border-cream/[0.08]";
  if (count < 4) return "bg-orange/30 border-orange/40";
  if (count < 7) return "bg-orange/55 border-orange/60";
  if (count < 10) return "bg-orange/80 border-orange/80";
  return "bg-orange border-orange";
}

function pluralize(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function HeatmapGrid({ weeks }: { weeks: GithubActivityCell[][] }) {
  /**
   * Month label headers — one label per week column when the first non-future
   * day in that week falls in a new month. This mirrors GitHub's behavior
   * where month text only appears at the start of each month's column run.
   */
  const monthHeaders = useMemo(() => {
    let lastMonth = -1;
    return weeks.map((week) => {
      const firstReal = week.find((c) => !c.inFuture) ?? week[0];
      const month = new Date(firstReal.date).getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        return MONTH_LABELS[month];
      }
      return "";
    });
  }, [weeks]);

  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-1">
      <div className="inline-block min-w-full">
        {/* Month labels row */}
        <div className="flex gap-[3px] pl-[26px] mb-1.5">
          {monthHeaders.map((label, idx) => (
            <div
              key={idx}
              className="w-[12px] font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day-of-week labels + grid */}
        <div className="flex gap-[6px]">
          <div className="flex flex-col gap-[3px] w-[20px] pt-[1px]">
            {DAY_ROW_LABELS.map((label, idx) => (
              <div
                key={idx}
                className="h-[12px] font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink leading-[12px]"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {week.map((cell, d) => (
                  <div
                    key={d}
                    title={
                      cell.inFuture
                        ? cell.date
                        : `${pluralize(cell.contributions, "contribution")} on ${cell.date}`
                    }
                    className={cn(
                      "h-[12px] w-[12px] rounded-[3px] border transition-colors",
                      intensityClass(cell.contributions, cell.inFuture),
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-muted-ink">
      <span className="font-mono-jb text-[9px] uppercase tracking-[0.08em]">less</span>
      {[0, 2, 5, 8, 12].map((sample, idx) => (
        <span
          key={idx}
          className={cn(
            "h-[12px] w-[12px] rounded-[3px] border",
            intensityClass(sample, false),
          )}
        />
      ))}
      <span className="font-mono-jb text-[9px] uppercase tracking-[0.08em]">more</span>
    </div>
  );
}

function EmptyState({
  isOwnProfile,
  isLinked,
  onPromptLink,
}: {
  isOwnProfile: boolean;
  isLinked: boolean;
  onPromptLink?: () => void;
}) {
  if (!isOwnProfile) {
    return (
      <div className="rounded-md border border-dashed border-cream/[0.12] p-5 text-center">
        <p className="text-xs text-muted-ink">
          No GitHub activity to show yet.
        </p>
      </div>
    );
  }

  if (!isLinked) {
    return (
      <div className="rounded-md border border-dashed border-cream/[0.12] p-5 text-center space-y-2">
        <p className="text-sm text-cream/80">
          Connect GitHub to see your contributions.
        </p>
        <p className="text-xs text-muted-ink">
          We'll pull the last 52 weeks of activity into your profile.
        </p>
        {onPromptLink && (
          <button
            type="button"
            onClick={onPromptLink}
            className="mt-1 inline-flex items-center rounded-md bg-orange/90 hover:bg-orange px-3 py-1.5 text-xs font-semibold text-ink transition-colors"
          >
            Connect GitHub
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-cream/[0.12] p-5 text-center space-y-1">
      <p className="text-sm text-cream/80">
        GitHub is linked but we haven't pulled your data yet.
      </p>
      <p className="text-xs text-muted-ink">
        Click <strong className="text-cream">Sync</strong> above to fetch your contributions.
      </p>
    </div>
  );
}

/**
 * GitHub-style year heatmap rendered against the profile's
 * `github_daily_contributions` rows (via the 52w view). Mirrors the
 * familiar GitHub UX: month labels along the top, weekday labels on the
 * left, 5 intensity tiers from cream to orange.
 *
 * Hidden bonus: hovering a cell shows a native tooltip with the exact
 * date + contribution count.
 */
export function GithubActivityPanel({
  profileId,
  isOwnProfile,
  isLinked,
  onPromptLink,
}: GithubActivityPanelProps) {
  const { data, loading } = useGithubActivity(profileId);

  // For OTHER people's profiles with no data, hide the panel entirely — no
  // point cluttering the page with a "this person has no GitHub" callout.
  if (!isOwnProfile && (data?.isEmpty ?? true) && !loading) {
    return null;
  }

  const hasData = data && !data.isEmpty;

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-[22px] space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Doodle.Pulse size={14} className="text-orange" />
          <MonoCaption tone="cream">// github activity</MonoCaption>
        </div>
        {hasData && (
          <MonoCaption tone="cream" className="text-[9px]">
            {data.totalContributions.toLocaleString()} contribs ·{" "}
            {data.activeDays} active{" "}
            {data.activeDays === 1 ? "day" : "days"}
            {data.currentStreak > 0 && (
              <>
                {" · 🔥 "}
                {pluralize(data.currentStreak, "day")}
              </>
            )}{" "}
            · 52w
          </MonoCaption>
        )}
      </div>

      {loading && (
        <div className="h-[110px] rounded-md bg-cream/[0.03] animate-pulse" />
      )}

      {!loading && !hasData && (
        <EmptyState
          isOwnProfile={isOwnProfile}
          isLinked={isLinked}
          onPromptLink={onPromptLink}
        />
      )}

      {hasData && (
        <>
          <HeatmapGrid weeks={data.weeks} />
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <p className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink">
              last 52 weeks · synced from github
            </p>
            <Legend />
          </div>
        </>
      )}
    </div>
  );
}
