import {
  Doodle,
  MonoCaption,
  Sticker,
  StickerBadge,
} from "../../../components/tierd";

interface ChallengesHeroProps {
  activeCount: number;
  totalParticipants: string;
}

const ChallengesHero = ({
  activeCount,
  totalParticipants,
}: ChallengesHeroProps) => {
  return (
    <header className="flex items-end justify-between gap-6 flex-wrap mb-10">
      <div className="max-w-2xl">
        <StickerBadge
          color="orange"
          tilt={-2}
          icon={<Doodle.Bolt size={11} />}
          className="mb-4"
        >
          live challenges
        </StickerBadge>
        <h1 className="font-boldonse text-[48px] sm:text-[72px] lg:text-[92px] leading-[0.92] tracking-[-0.02em] text-cream">
          compete<span className="text-orange">.</span>
        </h1>
        <h1 className="font-boldonse text-[48px] sm:text-[72px] lg:text-[92px] leading-[0.95] text-orange mt-1">
          ship<span className="text-cream">.</span> climb
          <span className="text-cream">.</span>
        </h1>
        <p className="font-mono-jb text-[13px] sm:text-[14px] text-cream/70 mt-5 max-w-[580px] leading-[1.6]">
          Prove your skill through real builds, timed tasks, and ranked
          submissions. Every challenge is a chance to earn tier points, unlock
          badges, and move up the leaderboard.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href="#challenges-grid"
            className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform"
          >
            <Doodle.Bolt size={14} />
            browse active challenges
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Sticker
          color="cream"
          tilt={2}
          padding="md"
          radius="md"
          className="flex items-center gap-3.5 !py-3.5 !px-4"
        >
          <Doodle.Bolt size={20} className="text-orange" />
          <div>
            <div className="font-boldonse text-[26px] leading-none">
              {activeCount}
            </div>
            <MonoCaption tone="muted" className="text-[9px] mt-1">
              ACTIVE CHALLENGES
            </MonoCaption>
          </div>
        </Sticker>
        <Sticker
          color="peach"
          tilt={-2}
          padding="md"
          radius="md"
          className="flex items-center gap-3.5 !py-3.5 !px-4"
        >
          <Doodle.Pulse size={20} className="text-forest" />
          <div>
            <div className="font-boldonse text-[26px] leading-none">
              {totalParticipants}
            </div>
            <MonoCaption tone="muted" className="text-[9px] mt-1">
              TOTAL PARTICIPANTS
            </MonoCaption>
          </div>
        </Sticker>
      </div>
    </header>
  );
};

export default ChallengesHero;