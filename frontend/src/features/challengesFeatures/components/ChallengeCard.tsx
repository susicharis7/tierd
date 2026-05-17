import { Doodle } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import type { ChallengeAccent, ChallengeCardData } from "../challengesData";

interface ChallengeCardProps {
  challenge: ChallengeCardData;
  tilt: number;
}

const ACCENT_BG: Record<ChallengeAccent, string> = {
  orange: "bg-orange",
  plum: "bg-plum",
  forest: "bg-forest",
  tape: "bg-tape",
  peach: "bg-peach",
};

const ACCENT_FG: Record<ChallengeAccent, string> = {
  orange: "text-cream",
  plum: "text-cream",
  forest: "text-cream",
  tape: "text-ink",
  peach: "text-ink",
};

/**
 * A single dark challenge card in the grid. Slight per-instance tilt, colored
 * sticker dot in the top-right, status + difficulty chips, dashed tag pills,
 * and a stats footer with a cream `join →` button.
 */
const ChallengeCard = ({ challenge: c, tilt }: ChallengeCardProps) => {
  return (
    <div
      className="relative rounded-[18px] bg-ink-2 border border-ink-line p-6 flex flex-col"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div
        className={cn(
          "absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center shadow-press",
          ACCENT_BG[c.accent],
        )}
      >
        <Doodle.Bolt size={14} className={ACCENT_FG[c.accent]} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3.5">
        {c.status === "Live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-forest/20 text-sage border border-forest/50 font-mono-jb text-[9px] font-bold tracking-[0.05em] px-2 py-[3px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" /> LIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-tape/15 text-tape border border-tape/40 font-mono-jb text-[9px] font-bold tracking-[0.05em] px-2 py-[3px]">
            ⏳ UPCOMING
          </span>
        )}
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
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-cream/[0.04] border border-dashed border-cream/20 text-cream font-mono-jb text-[10px] px-2.5 py-[3px]"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-3.5 border-t border-dashed border-ink-line flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3.5 font-mono-jb text-[11px] text-cream">
          <span>
            <span className="text-orange mr-1">⏱</span>
            {typeof c.daysLeft === "number" ? `${c.daysLeft}d` : c.daysLeft}
          </span>
          <span>
            <span className="text-orange mr-0.5">+</span>
            {c.reward}
          </span>
          <span>
            <span className="text-orange mr-1">◢</span>
            {c.participants}
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-cream text-ink font-mono-jb text-[11px] font-bold px-3.5 py-1.5 hover:translate-y-px transition-transform"
        >
          {c.status === "Starts soon" ? "notify me" : "join →"}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
