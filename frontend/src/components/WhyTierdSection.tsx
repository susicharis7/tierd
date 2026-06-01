import { Doodle, StickerBadge, Tape, TierdLogo } from "./tierd";

/**
 * "Why Tierd." — the problem/promise section sandwiched between the hero
 * and the three pillars. Left column: kicker badge, big "broken" display,
 * supporting copy. Right column: two stacked comparison cards (OLD SOCIAL
 * vs TIERD.). Mountains doodle ghosts behind the right column for texture.
 */
const oldSocialPoints = [
  "followers = clout",
  "vibes-based ranking",
  "algorithm chooses for you",
  "shitposters at the top",
] as const;

interface TierdPoint {
  bold?: string;
  rest: string;
  boldOrange?: boolean;
}

const tierdPoints: readonly TierdPoint[] = [
  { bold: "code", rest: " = your tier" },
  { rest: "14 weighted signals, no vibes" },
  { rest: "chronological feed, you choose" },
  { bold: "shippers", rest: " at the top", boldOrange: true },
];

const WhyTierdSection = () => {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden">
      <Doodle.Mountains
        w={400}
        h={150}
        className="absolute bottom-10 right-14 text-orange/10 pointer-events-none hidden lg:block"
        aria-hidden
      />

      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20 items-center">
          {/* Left — kicker + headline + copy */}
          <div>
            <StickerBadge color="cream" tilt={-2} className="mb-6">
              WHY <TierdLogo to={null} size="xs" tone="ink" />?
            </StickerBadge>
            <h2 className="font-boldonse text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] text-cream">
              social media for devs is{" "}
              <span className="text-orange">broken</span>.
            </h2>
            <div className="mt-7 max-w-[540px] font-grot text-[16px] sm:text-[18px] text-cream/75 leading-[1.6] space-y-5">
              <p>
                Twitter rewards hot takes. LinkedIn rewards humblebrags. GitHub
                doesn't have a feed. None of them know if you can actually
                ship.
              </p>
              <p>
                <b className="text-cream">
                  <TierdLogo to={null} size="xs" tone="cream" /> ranks the
                  work, not the noise.
                </b>{" "}
                Every commit, PR, deploy, and challenge win moves your tier.
                No followers required.
              </p>
            </div>
          </div>

          {/* Right — comparison cards */}
          <div className="flex flex-col gap-3.5">
            {/* OLD SOCIAL */}
            <div className="rounded-[16px] border border-dashed border-cream/15 bg-cream/[0.03] p-5">
              <p className="font-mono-jb text-[11px] uppercase tracking-[0.12em] text-muted-ink">
                OLD SOCIAL
              </p>
              <ul className="mt-3 space-y-1 font-grot text-[16px] sm:text-[17px] leading-[1.6] text-cream/60">
                {oldSocialPoints.map((point) => (
                  <li
                    key={point}
                    className="opacity-70 line-through decoration-orange decoration-[2px]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* TIERD. */}
            <div
              className="relative rounded-[16px] bg-cream text-ink p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              style={{ transform: "rotate(0.8deg)" }}
            >
              <Tape color="tape" size="md" tilt={-5} className="top-[-10px] left-8" />
              <div className="font-mono-jb text-[11px] uppercase tracking-[0.12em] text-muted-cream">
                <TierdLogo to={null} size="xs" tone="ink" />
              </div>
              <ul className="mt-3 space-y-1.5 font-grot font-semibold text-[16px] sm:text-[17px] leading-[1.65] text-ink">
                {tierdPoints.map((p, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="text-orange shrink-0">✓</span>
                    <span>
                      {p.bold && (
                        <b className={p.boldOrange ? "text-orange" : ""}>
                          {p.bold}
                        </b>
                      )}
                      {p.rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTierdSection;
