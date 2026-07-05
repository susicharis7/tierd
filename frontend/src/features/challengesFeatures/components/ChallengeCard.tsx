import { Link } from "react-router-dom";
import { Doodle } from "../../../components/tierd";
import {
  InlineSpinner,
  SkeletonButton,
  SkeletonLine,
} from "../../../components/ui/loading";
import { cn } from "../../../lib/utils";
import type { ChallengeOverviewRow } from "../../../repositories/challengeRepository";
import {
  formatChallengeStartsIn,
  formatChallengeTimeLeft,
} from "../useChallengesData";

interface ChallengeCardProps {
  challenge: ChallengeOverviewRow;
  tilt: number;
  isJoined: boolean;
  joinPending: boolean;
  onJoin: (challengeId: string) => void;
}

const ACCENT_BG: Record<string, string> = {
  backend: "bg-plum",
  web: "bg-orange",
  ai: "bg-forest",
  ui: "bg-tape",
  "open source": "bg-peach",
};

const ACCENT_FG: Record<string, string> = {
  backend: "text-cream",
  web: "text-cream",
  ai: "text-cream",
  ui: "text-ink",
  "open source": "text-ink",
};

function statusLabel(phase: ChallengeOverviewRow["phase"]) {
  if (phase === "active") return "LIVE";
  if (phase === "upcoming") return "UPCOMING";
  return "ENDED";
}

const ChallengeCard = ({
  challenge: c,
  tilt,
  isJoined,
  joinPending,
  onJoin,
}: ChallengeCardProps) => {
  const categoryKey = c.category.toLowerCase();
  const accentBg = ACCENT_BG[categoryKey] ?? "bg-orange";
  const accentFg = ACCENT_FG[categoryKey] ?? "text-cream";
  const timer =
    c.phase === "upcoming"
      ? formatChallengeStartsIn(c.starts_at)
      : formatChallengeTimeLeft(c.ends_at);

  return (
    <div
      className="relative rounded-[18px] bg-ink-2 border border-ink-line p-6 flex flex-col"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div
        className={cn(
          "absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center shadow-press",
          accentBg,
        )}
      >
        <Doodle.Bolt size={14} className={accentFg} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border font-mono-jb text-[9px] font-bold tracking-[0.05em] px-2 py-[3px]",
            c.phase === "active"
              ? "bg-forest/20 text-sage border-forest/50"
              : c.phase === "upcoming"
                ? "bg-tape/15 text-tape border-tape/40"
                : "bg-cream/10 text-cream/80 border-cream/20",
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" /> {statusLabel(c.phase)}
        </span>
        <span className="inline-flex items-center rounded-md bg-cream/[0.06] text-cream/80 font-mono-jb text-[9px] font-bold px-2 py-[3px]">
          {c.difficulty}
        </span>
      </div>

      <h3 className="font-grot font-extrabold text-[20px] text-cream leading-[1.15] mb-2 pr-9">
        {c.title}
      </h3>
      <p className="font-mono-jb text-[12px] text-muted-ink leading-[1.55] mb-4 min-h-[58px]">
        {c.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {[c.category, c.scope, c.status].map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-cream/[0.04] border border-dashed border-cream/20 text-cream font-mono-jb text-[10px] px-2.5 py-[3px]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-3.5 border-t border-dashed border-ink-line flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3.5 font-mono-jb text-[11px] text-cream">
          <span>
            <span className="text-orange mr-1">T</span>
            {timer ? `${timer}` : "ended"}
          </span>
          <span>
            <span className="text-orange mr-0.5">+</span>
            {c.reward_points}
          </span>
          <span>
            <span className="text-orange mr-1">P</span>
            {c.participants_count}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/challenges/${c.id}`}
            className="rounded-lg border border-cream/25 text-cream font-mono-jb text-[11px] font-bold px-3 py-1.5 hover:border-cream/50"
          >
            details
          </Link>
          <button
            type="button"
            disabled={joinPending || isJoined || c.phase !== "active"}
            onClick={() => onJoin(c.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cream text-ink font-mono-jb text-[11px] font-bold px-3.5 py-1.5 hover:translate-y-px transition-transform disabled:opacity-50"
          >
            {joinPending ? (
              <>
                <InlineSpinner tone="light" className="h-3 w-3" label="Joining challenge" />
                joining
              </>
            ) : isJoined ? "joined" : c.phase === "active" ? "join" : "locked"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;

export function ChallengeCardSkeleton({ tilt }: { tilt: number }) {
  return (
    <div
      className="relative rounded-[18px] bg-ink-2 border border-ink-line p-6 flex flex-col"
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-hidden="true"
    >
      <SkeletonButton className="absolute top-4 right-4 h-7 w-7 rounded-lg" />
      <div className="mb-4 flex gap-2">
        <SkeletonButton className="h-6 w-16 rounded-md" />
        <SkeletonButton className="h-6 w-20 rounded-md" />
      </div>
      <SkeletonLine className="mb-3 h-6 w-4/5" />
      <div className="mb-5 min-h-[58px] space-y-2">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-2/3" />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <SkeletonButton className="h-6 w-20" />
        <SkeletonButton className="h-6 w-16" />
        <SkeletonButton className="h-6 w-20" />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-ink-line pt-3.5">
        <div className="flex gap-3">
          <SkeletonLine className="h-3 w-12" />
          <SkeletonLine className="h-3 w-10" />
          <SkeletonLine className="h-3 w-10" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton className="h-8 w-16 rounded-lg" />
          <SkeletonButton className="h-8 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
