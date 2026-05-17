import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Doodle, StickerBadge } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { verifyFaqs } from "../getVerifiedData";
import EvaluationReport from "./EvaluationReport";
import EvaluationSteps from "./EvaluationSteps";
import GetVerifiedHero from "./GetVerifiedHero";

const FAQ_BG: Record<"peach" | "cream" | "sage", string> = {
  peach: "bg-peach text-ink",
  cream: "bg-cream text-ink",
  sage: "bg-sage text-ink",
};

const GetVerifiedPageContent = () => {
  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative">
      <Navbar />

      <GetVerifiedHero />
      <EvaluationSteps />
      <EvaluationReport />

      <FaqSection />
      <FinalCTA />

      <Footer />
    </div>
  );
};

const FaqSection = () => (
  <section className="pt-16 pb-12">
    <div className="section-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {verifyFaqs.map((f) => (
          <div
            key={f.q}
            className={cn(
              "relative rounded-[14px] p-5 shadow-sticker",
              FAQ_BG[f.color],
            )}
            style={{ transform: `rotate(${f.tilt}deg)` }}
          >
            <span className="absolute -top-2 left-4 font-boldonse text-[18px] text-orange">
              ?
            </span>
            <h3 className="font-grot font-extrabold text-[16px] mb-1.5">
              {f.q}
            </h3>
            <p className="font-mono-jb text-[11px] text-muted-cream leading-[1.55]">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="pt-12 pb-24 relative text-center">
    <Doodle.Mountains
      w={680}
      h={200}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 text-orange/[0.08] hidden lg:block pointer-events-none"
      aria-hidden
    />
    <div className="section-container relative">
      <StickerBadge color="orange" tilt={-2} icon={<Doodle.Bolt size={11} />}>
        your move
      </StickerBadge>
      <h2 className="font-boldonse text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.95] tracking-[-0.02em] text-cream mt-6">
        your profile is your <span className="text-orange">proof.</span>
      </h2>
      <p className="font-mono-jb text-[13px] text-cream/75 mt-5 max-w-[520px] mx-auto leading-[1.6]">
        Connect your work, get evaluated, and claim your rank on the ladder.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform"
        >
          <Doodle.Bolt size={14} />
          start evaluation
        </button>
        <Link
          to="/leaderboard"
          className="inline-flex items-center rounded-full border-[1.5px] border-dashed border-cream/30 text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 hover:border-cream/50 transition-colors"
        >
          explore leaderboard →
        </Link>
      </div>
    </div>
  </section>
);

export default GetVerifiedPageContent;
