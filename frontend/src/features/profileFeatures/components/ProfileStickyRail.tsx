import { Doodle, MonoCaption, Tape, UserAvatar } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { TECH_OPTIONS, type TechOption } from "../profileData";

interface ProfileStickyRailProps {
  tierCode: string | null;
  tierName: string;
  currentScore: number;
  nextTierName: string | null;
  pointsToNextTier: number;
  progressPct: number;
  weeklyScore: number;
  globalPercentile: number;
  /** Tech chips — items in `topTech` are highlighted (primary). */
  topTech: string[];
  onEditTech?: () => void;
  isOwnProfile: boolean;
  /** Last 7 day-bucket activity counts (Mon → Sun). */
  weekActivity: number[];
}

/**
 * Right-side sticky rail: Tier card → Activity bars → Tech stack → Endorsement.
 * Sits inside a sticky `aside` in the page grid; only renders content.
 */
const ProfileStickyRail = ({
  tierCode,
  tierName,
  currentScore,
  nextTierName,
  pointsToNextTier,
  progressPct,
  weeklyScore,
  globalPercentile,
  topTech,
  onEditTech,
  isOwnProfile,
  weekActivity,
}: ProfileStickyRailProps) => {
  return (
    <div className="space-y-[18px]">
      <TierCard
        tierCode={tierCode}
        tierName={tierName}
        currentScore={currentScore}
        nextTierName={nextTierName}
        pointsToNextTier={pointsToNextTier}
        progressPct={progressPct}
        weeklyScore={weeklyScore}
        globalPercentile={globalPercentile}
      />
      <ActivityCard data={weekActivity} />
      <TechStackCard
        topTech={topTech}
        onEditTech={onEditTech}
        isOwnProfile={isOwnProfile}
      />
      <EndorsementCard />
    </div>
  );
};

interface TierCardProps {
  tierCode: string | null;
  tierName: string;
  currentScore: number;
  nextTierName: string | null;
  pointsToNextTier: number;
  progressPct: number;
  weeklyScore: number;
  globalPercentile: number;
}

const TierCard = ({
  tierCode,
  tierName,
  currentScore,
  nextTierName,
  pointsToNextTier,
  progressPct,
  weeklyScore,
  globalPercentile,
}: TierCardProps) => {
  const code = tierCode ?? "—";
  const nextTotal = currentScore + pointsToNextTier;
  const percentileLabel = `TOP ${Math.max(1, Math.round(globalPercentile))}%`;
  const weeklyLabel =
    weeklyScore === 0
      ? "0"
      : `${weeklyScore > 0 ? "+" : ""}${weeklyScore}`;

  return (
    <div
      className="relative overflow-hidden rounded-[22px] bg-orange text-cream p-6 shadow-glow-orange"
      style={{ transform: "rotate(-0.8deg)" }}
    >
      <Tape color="cream" size="md" tilt={5} className="top-[-10px] right-8" />
      <Doodle.Sparkle
        size={28}
        className="absolute top-7 right-6 text-cream pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={16}
        className="absolute top-5 right-16 text-cream/70 pointer-events-none"
        aria-hidden
      />

      <MonoCaption
        tone="cream"
        className="!text-cream/70 !tracking-[0.15em]"
      >
        // CURRENT TIER
      </MonoCaption>
      <div className="flex items-baseline gap-4 mt-3">
        <div className="font-boldonse text-[80px] sm:text-[96px] leading-[0.9] text-cream">
          {code}
        </div>
        <div className="pb-3.5">
          <div className="font-grot font-extrabold text-[22px] text-cream">
            {tierName}
          </div>
          <p className="font-mono-jb text-[11px] uppercase tracking-[0.12em] text-cream/70">
            {percentileLabel} · GLOBAL
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t-[1.5px] border-dashed border-cream/30">
        {nextTierName ? (
          <>
            <div className="flex items-center justify-between mb-2 font-mono-jb text-[11px] text-cream">
              <span>
                {pointsToNextTier} pts to <b>{nextTierName}</b>
              </span>
              <span>
                {currentScore.toLocaleString()} /{" "}
                {nextTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="relative h-full bg-cream rounded-full"
                style={{ width: `${Math.max(3, Math.min(100, progressPct))}%` }}
              >
                <div className="absolute right-0 -top-[3px] w-4 h-4 rounded-full bg-cream border-[3px] border-orange" />
              </div>
            </div>
          </>
        ) : (
          <p className="font-mono-jb text-[11px] uppercase tracking-[0.12em] text-cream text-center">
            top tier reached · stay shipping
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div>
          <div className="font-boldonse text-[20px] text-cream">{weeklyLabel}</div>
          <MonoCaption tone="cream" className="!text-cream/70">
            THIS WEEK
          </MonoCaption>
        </div>
        <div>
          <div className="font-boldonse text-[20px] text-cream">
            {percentileLabel}
          </div>
          <MonoCaption tone="cream" className="!text-cream/70">
            PERCENTILE
          </MonoCaption>
        </div>
      </div>
    </div>
  );
};

interface ActivityCardProps {
  data: number[];
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const ActivityCard = ({ data }: ActivityCardProps) => {
  const max = Math.max(1, ...data);
  const total = data.reduce((a, b) => a + b, 0);
  const streak = data.filter((v) => v > 0).length;

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-[22px]">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <Doodle.Pulse size={14} className="text-orange" />
          <MonoCaption tone="cream">// this week</MonoCaption>
        </div>
        <MonoCaption tone="cream" className="text-[9px]">
          {total} contribs · 🔥 {streak}d
        </MonoCaption>
      </div>
      <div className="flex items-end gap-2 h-[100px]">
        {data.map((v, i) => {
          const pct = (v / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "w-full rounded transition-[height]",
                  v === 0 ? "bg-cream/[0.08]" : "bg-orange",
                )}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
              <span className="font-mono-jb text-[9px] uppercase tracking-[0.06em] text-muted-ink">
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TechStackCardProps {
  topTech: string[];
  onEditTech?: () => void;
  isOwnProfile: boolean;
}

const TechStackCard = ({
  topTech,
  onEditTech,
  isOwnProfile,
}: TechStackCardProps) => {
  const subTech = TECH_OPTIONS.filter(
    (t) => !topTech.includes(t),
  ) as readonly TechOption[];

  return (
    <div className="rounded-[18px] bg-cream/[0.04] border border-cream/[0.08] p-[22px]">
      <div className="flex items-center gap-2.5 mb-3.5">
        <Doodle.CodeBracket size={14} className="text-orange" />
        <MonoCaption tone="cream">// stack</MonoCaption>
        <div className="flex-1 h-px bg-cream/10" />
        {isOwnProfile && onEditTech && (
          <button
            type="button"
            onClick={onEditTech}
            className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-cream/60 hover:text-cream transition-colors"
          >
            edit
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topTech.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full bg-orange text-cream font-mono-jb font-medium text-[11px] px-[11px] py-[5px]"
          >
            {t}
          </span>
        ))}
        {subTech.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full bg-cream/[0.06] text-cream border border-dashed border-cream/20 font-mono-jb text-[11px] px-[11px] py-[5px]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const EndorsementCard = () => (
  <div
    className="relative rounded-[16px] bg-cream text-ink p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
    style={{ transform: "rotate(1.2deg)" }}
  >
    <Tape color="tape" size="md" tilt={-4} className="top-[-10px] left-8" />
    <div className="font-boldonse text-[30px] text-orange leading-none">
      &ldquo;
    </div>
    <p className="font-grot font-medium text-[14px] mt-1.5 leading-[1.5]">
      Tarik builds tools I actually use. ships fast, reviews patiently, and
      cares about DX more than anyone i know.
    </p>
    <div className="flex items-center gap-2.5 mt-3.5">
      <UserAvatar name="L" size={28} />
      <div>
        <div className="font-mono-jb text-[11px] font-bold text-ink">
          @lenam · T1
        </div>
        <div className="font-mono-jb text-[8px] uppercase tracking-[0.1em] text-muted-cream">
          endorsed · 3d ago
        </div>
      </div>
    </div>
  </div>
);

export default ProfileStickyRail;
