import {
  Doodle,
  ScribbleUnderline,
  StickerBadge,
} from "../../../components/tierd";

/**
 * Centered hero — sticker kicker, massive "get verified" with scribble
 * underline under the orange word, copy, two CTAs, and a verifier trust strip.
 */
const GetVerifiedHero = () => {
  return (
    <section className="relative pt-32 pb-16">
      <Doodle.Shield
        size={300}
        className="absolute top-16 right-12 text-orange/10 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={30}
        className="absolute top-28 left-[14%] text-orange/60 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={18}
        className="absolute top-44 left-[22%] text-tape hidden xl:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Asterisk
        size={28}
        className="absolute top-20 right-[18%] text-orange/50 hidden lg:block pointer-events-none"
        aria-hidden
      />

      <div className="section-container relative text-center max-w-[880px] mx-auto">
        <StickerBadge
          color="orange"
          tilt={-1.5}
          icon={<Doodle.Shield size={11} />}
          className="mb-7"
        >
          Developer Evaluation · v2
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
          and place you on the ladder. No vibes. Just receipts.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 mt-8">
          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-full bg-orange text-cream font-mono-jb text-[14px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform"
          >
            <Doodle.Bolt size={14} />
            start evaluation
            <span className="rounded-md bg-black/20 text-[10px] font-bold px-1.5 py-0.5 ml-1">
              ~4 min
            </span>
          </button>
          <a
            href="#how-it-works"
            className="inline-flex items-center rounded-full border-[1.5px] border-cream/30 text-cream font-mono-jb text-[14px] font-bold px-7 py-3.5 hover:border-cream/50 transition-colors"
          >
            see how it works ↓
          </a>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 font-mono-jb text-[11px] text-muted-ink">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            4,201 devs verified
          </span>
          <span className="text-cream/20">·</span>
          <span>
            avg score <b className="text-cream">842</b> / 2000
          </span>
          <span className="text-cream/20">·</span>
          <span>
            GitHub <span className="text-cream">✓</span> GitLab{" "}
            <span className="text-cream">✓</span> npm{" "}
            <span className="text-cream">✓</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default GetVerifiedHero;
