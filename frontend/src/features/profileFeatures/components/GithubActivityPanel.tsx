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
  /** Tighter cells + smaller padding so the panel fits in the sidebar rail. */
  compact?: boolean;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

type GridSize = {
  cell: number; // px
  gap: number; // px
  dayCol: number; // width of the leftmost weekday-label column, px
};
const SIZE_DEFAULT: GridSize = { cell: 12, gap: 3, dayCol: 20 };
const SIZE_COMPACT: GridSize = { cell: 10, gap: 2, dayCol: 18 };

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

function HeatmapGrid({
  weeks,
  size,
}: {
  weeks: GithubActivityCell[][];
  size: GridSize;
}) {
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

  const cellStyle = { height: size.cell, width: size.cell };
  const colStyle = { width: size.cell };
  const dayLabelStyle = { height: size.cell, lineHeight: `${size.cell}px` };

  return (
    <div className="overflow-x-auto -mx-1 px-1 pb-1">
      <div className="inline-block min-w-full">
        {/* Month labels row */}
        <div
          className="flex mb-1.5"
          style={{ gap: size.gap, paddingLeft: size.dayCol + 6 }}
        >
          {monthHeaders.map((label, idx) => (
            <div
              key={idx}
              style={colStyle}
              className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day-of-week labels + grid */}
        <div className="flex gap-[6px]">
          <div
            className="flex flex-col pt-[1px]"
            style={{ gap: size.gap, width: size.dayCol }}
          >
            {DAY_ROW_LABELS.map((label, idx) => (
              <div
                key={idx}
                style={dayLabelStyle}
                className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: size.gap }}>
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col" style={{ gap: size.gap }}>
                {week.map((cell, d) => (
                  <div
                    key={d}
                    title={
                      cell.inFuture
                        ? cell.date
                        : `${pluralize(cell.contributions, "contribution")} on ${cell.date}`
                    }
                    style={cellStyle}
                    className={cn(
                      "rounded-[3px] border transition-colors",
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

function Legend({ size }: { size: GridSize }) {
  return (
    <div className="flex items-center gap-2 text-muted-ink">
      <span className="font-mono-jb text-[9px] uppercase tracking-[0.08em]">less</span>
      {[0, 2, 5, 8, 12].map((sample, idx) => (
        <span
          key={idx}
          style={{ height: size.cell, width: size.cell }}
          className={cn(
            "rounded-[3px] border",
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
  compact = false,
}: GithubActivityPanelProps) {
  const { data, loading } = useGithubActivity(profileId);

  // For OTHER people's profiles with no data, hide the panel entirely — no
  // point cluttering the page with a "this person has no GitHub" callout.
  if (!isOwnProfile && (data?.isEmpty ?? true) && !loading) {
    return null;
  }

  const hasData = data && !data.isEmpty;
  const size = compact ? SIZE_COMPACT : SIZE_DEFAULT;
  const outerPadding = compact ? "p-[18px]" : "p-[22px]";
  const innerSpacing = compact ? "space-y-3" : "space-y-4";

  return (
    <div
      className={cn(
        "rounded-[18px] bg-cream/[0.04] border border-cream/[0.08]",
        outerPadding,
        innerSpacing,
      )}
    >
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
          <HeatmapGrid weeks={data.weeks} size={size} />
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <p className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-ink">
              last 52 weeks · synced from github
            </p>
            <Legend size={size} />
          </div>
        </>
      )}
    </div>
  );
}
