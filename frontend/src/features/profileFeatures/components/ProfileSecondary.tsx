import { Doodle, MonoCaption } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { BADGE_BG, BADGE_TILTS, profileBadges } from "../profileData";

interface ProfileSecondaryProps {
  contributionsLabel?: string;
  heatmapData: number[][];
}

const HEATMAP_LEVELS: Record<number, string> = {
  0: "bg-cream/[0.08]",
  1: "bg-orange/20",
  2: "bg-orange/40",
  3: "bg-orange/60",
  4: "bg-orange/85",
};

const heatmapColor = (level: number) => HEATMAP_LEVELS[level] ?? "bg-orange";

/**
 * Two stacked panels that follow the identity hero: a 3-col badges grid
 * (wraps onto more rows as needed), and the 52-week activity heatmap.
 * Tech stack used to live here — it's now inside `ProfileIdentityCard`.
 */
const ProfileSecondary = ({
  contributionsLabel = "Contributions over the last year",
  heatmapData,
}: ProfileSecondaryProps) => {
  return (
    <div className="space-y-5">
      <BadgesCard />
      <HeatmapCard data={heatmapData} contributionsLabel={contributionsLabel} />
    </div>
  );
};

const BadgesCard = () => (
  <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-5 sm:p-6">
    <div className="flex items-center gap-2.5 mb-4 flex-wrap">
      <Doodle.Trophy size={14} className="text-orange" />
      <MonoCaption tone="cream">
        // badges · {String(profileBadges.length).padStart(2, "0")} earned
      </MonoCaption>
      <Doodle.ArrowSquiggle w={40} h={14} className="text-orange" />
      <div className="flex-1" />
      <MonoCaption tone="cream" className="text-[9px]">
        view all
      </MonoCaption>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {profileBadges.map((b, i) => (
        <div
          key={b.label}
          className={cn(
            "rounded-[14px] px-4 py-4 shadow-[0_4px_0_rgba(0,0,0,0.18),0_8px_18px_rgba(0,0,0,0.15)] cursor-pointer flex items-center gap-3.5",
            BADGE_BG[b.accent],
          )}
          style={{ transform: `rotate(${BADGE_TILTS[i % BADGE_TILTS.length]}deg)` }}
        >
          <div className="text-[26px] leading-none shrink-0">{b.glyph}</div>
          <div className="min-w-0">
            <div className="font-grot font-extrabold text-[13px] leading-[1.2] truncate">
              {b.label}
            </div>
            <div
              className={cn(
                "font-mono-jb text-[9px] uppercase tracking-[0.08em] mt-1",
                b.accent === "tape" || b.accent === "sage"
                  ? "text-muted-cream"
                  : "text-cream/70",
              )}
            >
              {b.earned}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface HeatmapCardProps {
  data: number[][];
  contributionsLabel: string;
}

const HeatmapCard = ({ data, contributionsLabel }: HeatmapCardProps) => (
  <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-5">
    <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
      <div className="flex items-center gap-2.5">
        <Doodle.Pulse size={14} className="text-orange" />
        <MonoCaption tone="cream">// activity · last 52w</MonoCaption>
      </div>
      <div className="flex items-center gap-1 font-mono-jb text-[9px] text-muted-ink">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={cn("w-2.5 h-2.5 rounded-[2px]", heatmapColor(l))} />
        ))}
        <span>more</span>
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]" style={{ minWidth: 620 }}>
        {data.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={cn(
                  "w-[10px] h-[10px] rounded-[2px] transition-colors",
                  heatmapColor(day),
                )}
                title={`Week ${wi + 1}, Day ${di + 1}: ${day} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
    <p className="font-mono-jb text-[10px] text-muted-ink mt-3">
      <span className="font-bold text-cream/70">{contributionsLabel}</span>
    </p>
  </div>
);

export default ProfileSecondary;
