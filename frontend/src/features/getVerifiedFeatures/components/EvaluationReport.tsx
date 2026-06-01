import {
  Doodle,
  MonoCaption,
  Sticker,
  Tape,
  type Tier,
} from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../authFeatures/AuthProvider";
import {
  getTierDisplayName,
  getTierRangeLabel,
  mapTierToBadge,
} from "../../rankingFeatures/tierMapping";
import { useProfileProgressQuery } from "../../rankingFeatures/useRankingData";
import {
  evaluationSignals,
  STEP_ACCENT_BG,
  tierLadder,
} from "../getVerifiedData";

const EvaluationReport = () => {
  const { userId } = useAuth();
  const progressQuery = useProfileProgressQuery(userId);
  const progress = progressQuery.data;

  const projectedTier: Tier = mapTierToBadge(progress?.tierCode ?? progress?.tierName);
  const projectedTierName = getTierDisplayName(projectedTier, progress?.tierName);
  const projectedScore = progress?.totalScore ?? null;

  return (
    <section className="py-12" id="how-it-works">
      <div className="section-container grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <SignalReport />
        <TierPreview
          activeTier={projectedTier}
          tierName={projectedTierName}
          score={projectedScore}
        />
      </div>
    </section>
  );
};

const SignalReport = () => (
  <Sticker color="cream" tilt={-0.8} padding="xl" radius="xl" className="relative">
    <Tape color="tape" size="md" tilt={5} className="-top-[10px] right-16" />

    <div className="flex items-baseline justify-between mb-2">
      <div>
        <MonoCaption tone="muted" className="text-muted-cream text-[10px]">
          // EVALUATION REPORT PREVIEW
        </MonoCaption>
        <h3 className="font-grot font-extrabold text-[22px] sm:text-[26px] text-ink mt-1.5">
          what we evaluate
        </h3>
      </div>
      <span className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-cream hidden sm:inline">
        SIGNALS WEIGHTED
      </span>
    </div>

    <ul className="flex flex-col gap-4 mt-6">
      {evaluationSignals.map((s) => (
        <li key={s.label}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={cn("w-1.5 h-1.5 rounded-full", STEP_ACCENT_BG[s.dot])} />
              <span className="font-grot font-bold text-[14px] text-ink">{s.label}</span>
              <span className="font-mono-jb text-[11px] text-muted-cream truncate">. {s.value}</span>
            </div>
            <span className="font-mono-jb text-[11px] font-bold text-ink shrink-0">{s.weight}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink/[0.08] overflow-hidden">
            <div
              className={cn("h-full rounded-full", STEP_ACCENT_BG[s.dot])}
              style={{ width: `${Math.min(100, s.weight * 4)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>

    <div className="mt-6 p-3.5 rounded-xl bg-orange/[0.1] border-[1.5px] border-dashed border-orange flex items-center gap-3">
      <Doodle.Asterisk size={20} className="text-orange shrink-0" />
      <p className="font-mono-jb text-[11px] text-muted-cream leading-[1.5]">
        <b className="text-ink">We weight real work over vanity metrics.</b> Verified ownership and delivery cadence
        matter most.
      </p>
    </div>
  </Sticker>
);

interface TierPreviewProps {
  activeTier: Tier;
  tierName: string;
  score: number | null;
}

const TierPreview = ({ activeTier, tierName, score }: TierPreviewProps) => {
  return (
    <div className="relative rounded-[22px] bg-ink-2 border border-ink-line p-7 overflow-hidden">
      <Doodle.Mountains
        w={260}
        h={100}
        className="absolute -bottom-3 -right-5 text-orange/15 pointer-events-none"
        aria-hidden
      />

      <MonoCaption tone="orange">// YOUR PROJECTED OUTCOME</MonoCaption>
      <h3 className="font-grot font-extrabold text-[22px] sm:text-[24px] text-cream mt-2 leading-[1.2]">
        You are currently here.
      </h3>

      <div className="flex items-baseline gap-3 mt-6">
        <span className="font-boldonse text-[72px] sm:text-[80px] text-orange leading-none">{activeTier}</span>
        <div>
          <p className="font-grot font-extrabold text-[18px] text-cream">{tierName}</p>
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mt-0.5">
            {score !== null ? `score ${score.toLocaleString()}` : "score pending"}
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-2">
        {tierLadder.map((row) => {
          const rowName = getTierDisplayName(row.code);
          const rowRange = getTierRangeLabel(row.code);
          const current = row.code === activeTier;
          const locked = row.code === "T0";
          return (
            <div
              key={row.code}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border",
                current
                  ? "bg-orange/[0.12] border-orange"
                  : "bg-cream/[0.03] border-cream/[0.08]",
              )}
            >
              <span
                className={cn(
                  "font-boldonse text-[13px] min-w-[24px]",
                  locked ? "text-muted-ink" : current ? "text-orange" : "text-cream",
                )}
              >
                {row.code}
              </span>
              <span
                className={cn(
                  "font-grot font-bold text-[13px] flex-1 inline-flex items-center gap-1.5",
                  locked ? "text-muted-ink" : "text-cream",
                )}
              >
                {rowName}
                {locked && <span className="font-mono-jb text-[10px] text-muted-ink">LOCK</span>}
              </span>
              <span className="font-mono-jb text-[9px] uppercase tracking-[0.1em] text-muted-ink">{rowRange}</span>
              {current && (
                <span className="rounded-[4px] bg-orange text-cream font-mono-jb text-[8px] font-bold px-1.5 py-px">
                  YOU
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluationReport;
