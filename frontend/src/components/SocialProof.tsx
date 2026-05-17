import {
  Doodle,
  MonoCaption,
  Sticker,
  StickerBadge,
  Tape,
  UserAvatar,
} from "./tierd";
import { cn } from "../lib/utils";

const marqueeItems = [
  "Top 12 in Bosnia",
  "5 verified projects",
  "Rising in AI",
  "7-week streak",
  "T1 Shipper",
  "Challenge Winner",
  "React Expert",
  "Open Source Contributor",
  "T0 Architect Unlocked",
  "3,200 PTS this month",
  "Rust Specialist",
  "Full Stack Builder",
];

const quotes = [
  {
    q: "I built more in 3 weeks on Tierd than 6 months on Twitter. Knowing my code actually moves a number is wild motivation.",
    who: "Tarik S.",
    role: "@skender04 · T1 Shipper · BiH",
    color: "cream",
    txt: "ink",
    tilt: -1.5,
  },
  {
    q: "Won my first challenge week 2. Got DM'd by 3 startups. The leaderboard works because the work is real.",
    who: "Lena M.",
    role: "@lenam · T1 · OSS contributor",
    color: "orange",
    txt: "cream",
    tilt: 1,
  },
  {
    q: "I don't post on Twitter. Don't want followers. Tierd ranked me T1 anyway. Best part — I stayed anonymous.",
    who: "Amir H.",
    role: "@amirh_ · T1 · Rust",
    color: "peach",
    txt: "ink",
    tilt: -0.8,
  },
] as const;

const stickerColorClass: Record<string, string> = {
  cream: "bg-cream text-ink",
  orange: "bg-orange text-cream",
  peach: "bg-peach text-ink",
};

const SocialProof = () => {
  return (
    <section className="relative py-24 border-t border-dashed border-cream/10 overflow-hidden">
      <Doodle.Mountains
        w={500}
        h={150}
        className="absolute top-16 left-4 text-orange/[0.08] hidden lg:block pointer-events-none"
        aria-hidden
      />

      {/* Marquee */}
      <div className="mb-16 relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ink to-transparent z-10" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="mx-3 px-4 py-2 rounded-full font-mono-jb text-[12px] font-semibold border border-dashed border-cream/20 text-cream/80 whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="section-container relative">
        <div className="text-center mb-12">
          <StickerBadge color="tape" tilt={-2}>
            builders say
          </StickerBadge>
          <h2 className="font-boldonse text-[44px] sm:text-[56px] lg:text-[64px] leading-[1] text-cream mt-5">
            <span className="text-orange">"</span>finally, a feed for shippers
            <span className="text-orange">."</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {quotes.map((t) => (
            <div
              key={t.who}
              className={cn(
                "relative rounded-[18px] p-7 shadow-sticker",
                stickerColorClass[t.color],
              )}
              style={{ transform: `rotate(${t.tilt}deg)` }}
            >
              <Tape color="tape" size="sm" tilt={-4} className="-top-[10px] left-8" />
              <div
                className={cn(
                  "font-boldonse text-[42px] leading-[0.8]",
                  t.txt === "cream" ? "text-cream/40" : "text-ink/20",
                )}
              >
                "
              </div>
              <p className="font-grot font-medium text-[16px] leading-[1.5] mt-2 mb-6">
                {t.q}
              </p>
              <div
                className={cn(
                  "flex items-center gap-3 pt-4 border-t border-dashed",
                  t.txt === "cream" ? "border-cream/30" : "border-ink/15",
                )}
              >
                <UserAvatar name={t.who} size={36} />
                <div>
                  <div className="font-grot font-extrabold text-[14px]">{t.who}</div>
                  <div className="font-mono-jb text-[10px] opacity-70 mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <MonoCaption tone="muted">
            // 4,201 devs verified · 99.2% real builders
          </MonoCaption>
        </div>

        {/* Stats strip */}
        <div className="mt-16">
          <Sticker color="cream" padding="xl" radius="2xl" className="relative">
            <div
              aria-hidden
              className="absolute inset-0 rounded-[24px] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <Doodle.Asterisk
              size={42}
              className="absolute top-6 right-10 text-orange pointer-events-none"
              aria-hidden
            />
            <Doodle.Sparkle
              size={20}
              className="absolute bottom-8 left-12 text-orange pointer-events-none"
              aria-hidden
            />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: "4,201", l: "devs verified", sub: "across 47 countries" },
                { n: "12,840", l: "projects shipped", sub: "in the last 90 days" },
                { n: "128", l: "challenges run", sub: "21 winners crowned" },
                { n: "99.2%", l: "real builders", sub: "no spam, no bots" },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={cn(
                    "pr-5",
                    i < 3 && "md:border-r md:border-dashed md:border-ink/15",
                  )}
                >
                  <div className="font-boldonse text-[48px] lg:text-[60px] leading-[0.9] text-orange">
                    {s.n}
                  </div>
                  <div className="font-grot font-extrabold text-[15px] text-ink mt-2">
                    {s.l}
                  </div>
                  <div className="font-mono-jb text-[10px] uppercase tracking-[0.1em] text-muted-cream mt-1">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </Sticker>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
