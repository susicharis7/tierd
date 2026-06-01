import { Link } from "react-router-dom";
import {
  Doodle,
  StickerBadge,
  Tape,
  MonoCaption,
} from "../../../components/tierd";
import type { ActiveChallenge } from "../../../services/rankingService";
import { formatChallengeTimeLeft } from "../useChallengesData";

interface FeaturedChallengeProps {
  challenge: ActiveChallenge | null | undefined;
  isPending: boolean;
}

const FeaturedChallenge = ({ challenge, isPending }: FeaturedChallengeProps) => {
  const title = challenge?.title ?? "No active challenge";
  const description =
    challenge?.description ??
    "Challenges will appear here when one is currently active.";
  const reward = challenge?.rewardPoints ?? 0;
  const participants = challenge?.participantsCount ?? 0;
  const timer = challenge ? formatChallengeTimeLeft(challenge.endsAt) : null;

  return (
    <div className="relative mb-12">
      <Tape color="tape" size="lg" tilt={-3} className="-top-3 left-24 z-10" />
      <div className="relative rounded-[22px] bg-cream text-ink p-7 sm:p-9 shadow-sticker overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              <StickerBadge color="orange" tilt={-2} icon={<Doodle.Trophy size={11} />}>
                FEATURED
              </StickerBadge>
              <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-forest text-cream font-mono-jb text-[11px] font-bold uppercase tracking-[0.1em] px-3.5 py-2 shadow-press">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                LIVE NOW
              </span>
            </div>

            <h2 className="font-boldonse text-[36px] sm:text-[48px] lg:text-[56px] leading-[0.95] text-ink mb-4">
              {isPending ? "Loading challenge..." : title}
            </h2>

            <p className="font-mono-jb text-[13px] sm:text-[14px] text-muted-cream leading-[1.6] max-w-[560px] mb-5">
              {description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-5 border-t-[1.5px] border-dashed border-ink/20">
              <StatBlock label="TIME LEFT" value={timer ?? "-"} />
              <StatBlock label="POINTS" value={`+${reward}`} />
              <StatBlock label="BUILDERS" value={`${participants}`} />
            </div>
          </div>

          <div className="self-center rounded-[16px] bg-ink text-cream p-5">
            <MonoCaption tone="cream" className="text-[10px] opacity-70">
              // CHALLENGE DETAILS
            </MonoCaption>
            <p className="font-grot font-extrabold text-[20px] leading-[1.2] mt-2">
              Ready to ship?
              <br />
              <span className="text-orange">Join the challenge.</span>
            </p>

            <Link
              to={challenge ? `/challenges/${challenge.id}` : "/challenges"}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange text-cream font-mono-jb text-[14px] font-bold px-4 py-3.5 shadow-press hover:translate-y-px transition-transform"
            >
              <Doodle.Bolt size={14} />
              OPEN CHALLENGE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-cream">
        {label}
      </div>
      <div className="mt-1 font-boldonse text-[26px] text-ink">{value}</div>
    </div>
  );
}

export default FeaturedChallenge;