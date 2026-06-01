import { Doodle } from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import {
  STEP_ACCENT_BG,
  STEP_ACCENT_TEXT,
  STEP_ACCENT_FG,
  STEP_TILTS,
  evaluationSteps,
} from "../getVerifiedData";

/**
 * 6 sticker step cards in a wide grid, joined by a dashed orange squiggle
 * connector on lg+ screens.
 */
const EvaluationSteps = () => {
  return (
    <section id="how-it-works" className="relative py-16">
      <SectionDivider />

      <div className="section-container relative">
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {/* Curved dashed connector — visible on lg+ where all 6 share a row */}
          <svg
            aria-hidden
            preserveAspectRatio="none"
            viewBox="0 0 1000 30"
            className="hidden lg:block absolute top-[60px] left-[80px] right-[80px] h-[30px] w-[calc(100%-160px)] z-0 pointer-events-none"
          >
            <path
              d="M0 15 C 150 0, 250 30, 400 15 S 700 0, 850 15 S 1000 30, 1000 15"
              stroke="hsl(var(--orange))"
              strokeOpacity="0.4"
              strokeWidth="2"
              strokeDasharray="6 4"
              fill="none"
            />
          </svg>

          {evaluationSteps.map((s, i) => (
            <div
              key={s.n}
              className="relative z-[1] rounded-[16px] bg-ink-2 border border-ink-line p-5 pt-7"
              style={{ transform: `rotate(${STEP_TILTS[i % STEP_TILTS.length]}deg)` }}
            >
              <span
                className={cn(
                  "absolute -top-[14px] right-3.5 rounded-lg px-2.5 py-1 font-boldonse text-[14px] shadow-press",
                  STEP_ACCENT_BG[s.accent],
                  STEP_ACCENT_FG[s.accent] === "ink" ? "text-ink" : "text-cream",
                )}
              >
                {s.n}
              </span>

              <div
                className={cn(
                  "w-11 h-11 rounded-xl bg-cream/[0.06] border border-dashed border-cream/20 flex items-center justify-center font-boldonse text-[22px] mb-3",
                  STEP_ACCENT_TEXT[s.accent],
                )}
              >
                {s.glyph}
              </div>

              <h3 className="font-grot font-extrabold text-[15px] text-cream mb-1.5">
                {s.title}
              </h3>
              <p className="font-mono-jb text-[11px] text-muted-ink leading-[1.55]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SectionDivider = () => (
  <div className="section-container mb-10">
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px border-b-[1.5px] border-dashed border-cream/[0.12]" />
      <div className="inline-flex items-baseline gap-3.5 font-grot font-extrabold text-[24px] sm:text-[32px] text-cream">
        <Doodle.ArrowSquiggle w={50} h={18} className="text-orange" />
        how <span className="text-orange">evaluation</span> works
      </div>
      <div className="flex-1 h-px border-b-[1.5px] border-dashed border-cream/[0.12]" />
    </div>
  </div>
);

export default EvaluationSteps;
