import { Doodle, StickerBadge, Tape } from "./tierd";
import { cn } from "../lib/utils";

/**
 * "The Ladder" — staggered showcase of the 4 named tiers (T3 → T0).
 * Cards have ascending heights, individual tilts, and the orange T1 card
 * gets a tape strip while the ink T0 card gets a sparkle + "INVITE ONLY"
 * footer line. Aligned to the design `screens/landing.jsx` tier strip.
 */

interface TierCard {
  code: string;
  name: string;
  range: string;
  desc: string;
  /** Tailwind class applied to the card surface (background). */
  bg: string;
  /** Tailwind class applied to text on the card surface. */
  fg: string;
  /** Caption tone for the points range. */
  rangeFg: string;
  /** Pixel height of the card. The whole strip aligns to flex-end. */
  h: number;
  /** Card tilt in degrees. */
  tilt: number;
  glow?: boolean;
  border?: boolean;
  hasTape?: boolean;
  hasSparkle?: boolean;
  inviteOnly?: boolean;
}

const tiers: TierCard[] = [
  {
    code: "T3",
    name: "Apprentice",
    range: "0 – 400 PTS",
    desc: "Just started. Show up daily.",
    bg: "bg-sage",
    fg: "text-ink",
    rangeFg: "text-muted-cream",
    h: 240,
    tilt: -2,
  },
  {
    code: "T2",
    name: "Builder",
    range: "400 – 1,200 PTS",
    desc: "Shipping consistently. Trusted.",
    bg: "bg-peach",
    fg: "text-ink",
    rangeFg: "text-muted-cream",
    h: 280,
    tilt: 1.2,
  },
  {
    code: "T1",
    name: "Shipper",
    range: "1,200 – 1,800 PTS",
    desc: "OSS contributor. Builds people use.",
    bg: "bg-orange",
    fg: "text-cream",
    rangeFg: "text-cream/70",
    h: 320,
    tilt: -1,
    glow: true,
    hasTape: true,
  },
  {
    code: "T0",
    name: "Architect",
    range: "1,800+ PTS",
    desc: "Top 1%. Sets the standard.",
    bg: "bg-ink-2",
    fg: "text-cream",
    rangeFg: "text-cream/70",
    h: 360,
    tilt: 0.8,
    border: true,
    hasSparkle: true,
    inviteOnly: true,
  },
];

const MAX_HEIGHT = 360;

const LadderSection = () => {
  return (
    <section className="relative pt-20 pb-[200px] sm:pt-[90px] sm:pb-[220px] overflow-x-clip">
      <Doodle.Sparkle
        size={26}
        className="absolute top-24 left-24 text-tape pointer-events-none hidden lg:block"
        aria-hidden
      />
      <Doodle.Asterisk
        size={32}
        className="absolute top-20 right-48 text-orange/60 pointer-events-none hidden lg:block"
        aria-hidden
      />

      <div className="section-container">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 lg:mb-14">
          <div>
            <StickerBadge color="plum" tilt={-2}>
              THE LADDER
            </StickerBadge>
            <h2 className="font-boldonse text-[56px] sm:text-[76px] lg:text-[92px] leading-[0.95] text-cream mt-5">
              4 tiers.<br />
              <span className="text-orange">1 leaderboard.</span>
            </h2>
          </div>
          <p className="font-mono-jb text-[13px] sm:text-[14px] text-muted-ink max-w-[360px] leading-[1.6]">
            Tiers unlock as you ship. Score weights real signals — code
            quality, consistency, open-source impact — over follower count.
          </p>
        </div>

        {/* Tier strip — staggered heights at lg, simple grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:items-end">
          {tiers.map((t) => {
            const offsetY = MAX_HEIGHT - t.h;
            return (
              <div
                key={t.code}
                className={cn(
                  "relative rounded-[22px] p-6 flex flex-col justify-between",
                  t.bg,
                  t.fg,
                  t.border ? "border-2 border-orange" : "",
                  t.glow
                    ? "shadow-[0_16px_50px_rgba(255,90,31,0.45),0_5px_0_rgba(0,0,0,0.2)]"
                    : "shadow-[0_12px_30px_rgba(0,0,0,0.3),0_4px_0_rgba(0,0,0,0.2)]",
                )}
                style={{
                  minHeight: t.h,
                  transform: `rotate(${t.tilt}deg) translateY(${offsetY}px)`,
                }}
              >
                {t.hasTape && (
                  <Tape
                    color="cream"
                    size="md"
                    tilt={6}
                    className="top-[-10px] right-7"
                  />
                )}
                {t.hasSparkle && (
                  <Doodle.Sparkle
                    size={20}
                    className="absolute top-4 right-4 text-orange pointer-events-none"
                    aria-hidden
                  />
                )}

                <div>
                  <div className="font-boldonse text-[64px] sm:text-[80px] leading-[0.85]">
                    {t.code}
                  </div>
                  <div className="font-grot font-extrabold text-[20px] sm:text-[22px] mt-2.5">
                    {t.name}
                  </div>
                  <p
                    className={cn(
                      "font-mono-jb text-[11px] uppercase tracking-[0.12em] mt-0.5",
                      t.rangeFg,
                    )}
                  >
                    {t.range}
                  </p>
                </div>

                <div>
                  <p
                    className={cn(
                      "font-mono-jb text-[11px] leading-[1.5]",
                      t.fg === "text-cream" ? "text-cream/85" : "text-ink/85",
                    )}
                  >
                    {t.desc}
                  </p>
                  {t.inviteOnly && (
                    <p className="mt-2.5 font-mono-jb font-bold text-[9px] uppercase tracking-[0.12em] text-orange">
                      🔒 INVITE ONLY
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LadderSection;
