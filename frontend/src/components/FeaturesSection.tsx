import { Doodle, MonoCaption, StickerBadge } from "./tierd";
import { cn } from "../lib/utils";

const pillars = [
  {
    kicker: "01 · SHIP",
    title: "Build in public, get points",
    body: "Every commit, deploy, and shipped feature feeds your tier. Drop a build, a screenshot, a snippet — earn points automatically when you connect GitHub.",
    accent: "bg-orange",
    icon: <Doodle.Bolt size={22} className="text-cream" />,
    tilt: -1.5,
    bullets: ["+30 per ship", "Auto-detect from gh", "Verified authorship"],
    accentText: "text-orange",
  },
  {
    kicker: "02 · COMPETE",
    title: "Win timed challenges",
    body: "Real builds, judged by your peers. CLI speedruns, AI mini-tools, OSS PR hunts. Top 3 get featured, +350 tier points, and a permanent badge.",
    accent: "bg-plum",
    icon: <Doodle.Trophy size={22} className="text-cream" />,
    tilt: 1,
    bullets: ["Weekly drops", "Judged by tier", "Real prize pools"],
    accentText: "text-plum",
  },
  {
    kicker: "03 · RANK",
    title: "Move up tiers, get seen",
    body: "T3 → T2 → T1 → T0. Each tier unlocks DMs, private channels, exclusive challenges, and a permanent place on the global leaderboard.",
    accent: "bg-forest",
    icon: <Doodle.Trophy size={22} className="text-cream" />,
    tilt: -0.8,
    bullets: ["4 named tiers", "Updated every 6h", "Anonymity-friendly"],
    accentText: "text-forest",
  },
] as const;

const FeaturesSection = () => {
  return (
    <section className="relative py-24 border-y border-dashed border-cream/10 bg-cream/[0.02]">
      <div className="section-container">
        <div className="text-center mb-14">
          <StickerBadge
            color="orange"
            tilt={-1}
            icon={<Doodle.Asterisk size={11} />}
          >
            three ways to climb
          </StickerBadge>
          <h2 className="font-boldonse text-[56px] sm:text-[72px] lg:text-[88px] leading-[0.95] text-cream mt-6">
            ship<span className="text-orange">.</span> compete
            <span className="text-orange">.</span> rank
            <span className="text-orange">.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1240px] mx-auto">
          {pillars.map((p) => (
            <div
              key={p.kicker}
              className="relative rounded-[22px] bg-ink-2 border border-ink-line p-8 pt-12"
              style={{ transform: `rotate(${p.tilt}deg)` }}
            >
              <div
                className={cn(
                  "absolute -top-5 left-6 px-3.5 py-2.5 rounded-xl shadow-press inline-flex items-center gap-2.5",
                  p.accent,
                )}
              >
                {p.icon}
                <span className="font-mono-jb font-bold text-[11px] text-cream uppercase tracking-[0.1em]">
                  {p.kicker}
                </span>
              </div>
              <h3 className="font-grot font-extrabold text-[26px] text-cream leading-[1.15] mt-4">
                {p.title}
              </h3>
              <p className="font-mono-jb text-[13px] text-muted-ink leading-[1.65] mt-3.5">
                {p.body}
              </p>
              <div className="h-px border-b border-dashed border-cream/10 my-5" />
              <ul className="space-y-2">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 font-mono-jb text-[12px] text-cream"
                  >
                    <Doodle.Plus size={10} className={p.accentText} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <MonoCaption tone="muted">
            // 14 weighted signals · no vibes · code = your tier
          </MonoCaption>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
