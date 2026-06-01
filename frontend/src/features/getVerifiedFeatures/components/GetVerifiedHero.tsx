import {
  Doodle,
  ScribbleUnderline,
  StickerBadge,
} from "../../../components/tierd";

interface GetVerifiedHeroProps {
  onStartEvaluation: () => void;
  startDisabled: boolean;
  startLabel?: string;
}

const GetVerifiedHero = ({
  onStartEvaluation,
  startDisabled,
  startLabel = "start evaluation",
}: GetVerifiedHeroProps) => {
  return (
    <section className="relative pt-32 pb-16">
      <Doodle.Shield
        size={300}
        className="absolute top-16 right-12 text-orange/10 hidden lg:block pointer-events-none"
        aria-hidden
      />

      <div className="section-container relative text-center max-w-[880px] mx-auto">
        <StickerBadge
          color="orange"
          tilt={-1.5}
          icon={<Doodle.Shield size={11} />}
          className="mb-7"
        >
          Developer Evaluation v2
        </StickerBadge>

        <h1 className="font-boldonse text-[64px] sm:text-[96px] lg:text-[124px] leading-[0.92] tracking-[-0.025em] text-cream">
          get
          <span className="relative inline-block ml-4 sm:ml-6 lg:ml-7 text-orange">
            verified
            <ScribbleUnderline
              w={420}
              className="absolute left-0 -bottom-2 text-orange w-full max-w-full"
            />
          </span>
        </h1>

        <p className="font-grot font-medium text-[18px] sm:text-[22px] text-cream mt-9">
          Prove your skill. <span className="text-orange">Claim your tier.</span>
        </p>

        <p className="font-mono-jb text-[13px] sm:text-[14px] text-cream/70 max-w-[600px] mx-auto leading-[1.6] mt-4">
          Tierd<span className="text-orange">.</span> evaluates projects,
          activity, proof of work, and developer signals to build your profile
          and place you on the ladder.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 mt-8">
          <button
            type="button"
            onClick={onStartEvaluation}
            disabled={startDisabled}
            className="inline-flex items-center gap-2.5 rounded-full bg-orange text-cream font-mono-jb text-[14px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Doodle.Bolt size={14} />
            {startLabel}
            <span className="rounded-md bg-black/20 text-[10px] font-bold px-1.5 py-0.5 ml-1">
              ~4 min
            </span>
          </button>
          <a
            href="#how-it-works"
            className="inline-flex items-center rounded-full border-[1.5px] border-cream/30 text-cream font-mono-jb text-[14px] font-bold px-7 py-3.5 hover:border-cream/50 transition-colors"
          >
            see how it works
          </a>
        </div>
      </div>
    </section>
  );
};

export default GetVerifiedHero;
