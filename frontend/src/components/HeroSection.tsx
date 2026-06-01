import { Link } from "react-router-dom";

import {
  Doodle,
  MonoCaption,
  ScribbleUnderline,
  Sticker,
  StickerBadge,
  Tape,
  UserAvatar,
} from "./tierd";
import { cn } from "../lib/utils";
import { useLandingTopBuildersQuery } from "../features/rankingFeatures/useRankingData";

const HeroSection = () => {
  const topBuildersQuery = useLandingTopBuildersQuery(5);
  const builders = topBuildersQuery.data ?? [];

  return (
    <section className="relative pt-28 sm:pt-32 pb-24 overflow-hidden">
      {/* Background type-mural */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute top-24 left-[-40px] right-[-40px] whitespace-nowrap text-orange/[0.06] font-boldonse leading-[0.85] tracking-[-0.04em] text-[180px] sm:text-[260px] lg:text-[340px]"
      >
        SHIP · CLIMB · RANK
      </div>

      {/* Floating doodles */}
      <Doodle.Asterisk
        size={48}
        className="absolute top-28 right-[10%] text-orange/80 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Asterisk
        size={28}
        className="absolute top-56 right-[18%] text-tape hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={36}
        className="absolute top-[380px] left-[8%] text-orange hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Sparkle
        size={22}
        className="absolute top-[440px] left-[5%] text-tape/70 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <Doodle.Dots
        rows={5}
        cols={8}
        className="absolute top-[540px] right-[6%] text-cream/[0.18] hidden xl:block pointer-events-none"
        aria-hidden
      />

      {/* Tape decorations */}
      <Tape color="tape" size="sm" tilt={-6} className="top-10 left-[18%] hidden md:block" />
      <Tape color="orange-soft" size="sm" tilt={4} className="top-14 right-[24%] hidden md:block" />

      <div className="section-container relative z-[2]">
        {/* Top badge cluster */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <StickerBadge
            color="orange"
            tilt={-2}
            icon={<Doodle.Bolt size={11} />}
          >
            now in public beta · BiH 🇧🇦
          </StickerBadge>
          <span className="font-mono-jb text-[11px] uppercase tracking-[0.1em] text-muted-ink inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            4,201 devs verified
          </span>
        </div>

        {/* Massive headline */}
        <div className="text-center">
          <h1 className="font-boldonse text-cream leading-[0.88] tracking-[-0.035em] text-[64px] sm:text-[96px] lg:text-[140px] xl:text-[168px]">
            the social for
          </h1>
          <div className="relative inline-block mt-1">
            <h1 className="font-boldonse leading-[0.88] tracking-[-0.035em] text-[64px] sm:text-[96px] lg:text-[140px] xl:text-[168px] text-orange">
              developers<span className="text-cream">.</span>
            </h1>
            <ScribbleUnderline
              w={680}
              className="absolute left-2 -bottom-2 sm:-bottom-3 text-orange hidden sm:block"
            />
          </div>

          <p className="font-grot font-medium text-lg sm:text-xl lg:text-2xl text-cream/85 mt-10 sm:mt-14 max-w-[760px] mx-auto leading-[1.45]">
            Built for the ones who actually ship. Get ranked by your code — not your
            follower count. Climb tiers, win challenges, and find the rare builders
            worth following.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3.5 mt-11">
            <Link
              to="/get-verified"
              className="inline-flex items-center gap-3 rounded-full bg-orange text-cream font-mono-jb text-[15px] font-bold px-9 py-[18px] shadow-cta-orange hover:translate-y-px transition-transform"
            >
              <Doodle.Bolt size={16} />
              get verified — it's free
              <span className="text-lg leading-none">→</span>
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 rounded-full bg-cream text-ink font-mono-jb text-[15px] font-bold px-7 py-[18px] shadow-press hover:translate-y-px transition-transform"
              style={{ transform: "rotate(-1deg)" }}
            >
              <Doodle.CodeBracket size={14} />
              see the leaderboard
            </Link>
          </div>

          {/* Trust strip */}
          <div className="inline-flex flex-wrap items-center gap-4 mt-9 px-5 py-3 rounded-full bg-cream/[0.04] border border-dashed border-cream/15">
            <div className="flex -space-x-3">
              {builders.slice(0, 5).map((b) => (
                <span
                  key={b.profileId}
                  className="rounded-full border-2 border-ink"
                >
                  <UserAvatar
                    name={b.fullName || b.username || "U"}
                    src={b.avatarUrl}
                    size={32}
                  />
                </span>
              ))}
            </div>
            <span className="font-mono-jb text-[12px] text-cream">
              <b>2,340+ builders</b> shipping this week
            </span>
            <span className="text-muted-ink">·</span>
            <span className="font-mono-jb text-[12px] text-muted-ink">
              avg <b className="text-orange">14 commits/week</b>
            </span>
          </div>
        </div>

        {/* Hero preview sticker cards */}
        <div className="relative mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr] gap-6">
          {/* Left — tier card preview */}
          <Sticker
            color="orange"
            tilt={-2.5}
            padding="lg"
            radius="xl"
            className="relative shadow-glow-orange"
          >
            <Tape color="cream" size="md" tilt={5} className="-top-[10px] right-10" />
            <Doodle.Sparkle
              size={24}
              className="absolute top-6 right-7 text-cream pointer-events-none"
              aria-hidden
            />
            <MonoCaption tone="cream" className="text-cream/70">// YOUR TIER</MonoCaption>
            <div className="flex items-baseline gap-3.5 mt-3.5">
              <div className="font-boldonse text-[80px] leading-[0.9] text-cream">T1</div>
              <div className="pb-3">
                <div className="font-grot font-extrabold text-[18px]">Shipper</div>
                <div className="font-mono-jb text-[11px] uppercase tracking-[0.1em] text-cream/70">
                  1,360 PTS · #2
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-cream" />
            </div>
            <div className="font-mono-jb text-[11px] uppercase tracking-[0.1em] text-cream/80 mt-2">
              40 PTS TO T2 BUILDER PRO
            </div>
          </Sticker>

          {/* Center — leaderboard preview using live data */}
          <Sticker
            color="dark"
            tilt={1}
            padding="lg"
            radius="xl"
            className="relative"
          >
            <Tape color="tape" size="md" tilt={-3} className="-top-[10px] left-10" />
            <div className="flex items-center gap-2.5 mb-4">
              <Doodle.Trophy size={14} className="text-orange" />
              <MonoCaption tone="cream">// THIS WEEK</MonoCaption>
              <div className="flex-1" />
              <span className="inline-flex items-center gap-1.5 font-mono-jb text-[9px] text-forest uppercase tracking-[0.1em]">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                LIVE
              </span>
            </div>

            {topBuildersQuery.isPending && (
              <p className="font-mono-jb text-[12px] text-muted-ink py-3">
                Loading top builders…
              </p>
            )}

            <div className="space-y-1">
              {builders.slice(0, 4).map((dev) => (
                <div
                  key={`${dev.profileId}-${dev.rank}`}
                  className={cn(
                    "flex items-center gap-2.5 px-1.5 py-2 rounded-lg border-b border-dashed border-cream/[0.08] last:border-0",
                  )}
                >
                  <span
                    className={cn(
                      "font-boldonse text-[14px] min-w-[20px]",
                      dev.rank <= 3 ? "text-orange" : "text-muted-ink",
                    )}
                  >
                    0{dev.rank}
                  </span>
                  <UserAvatar
                    name={dev.fullName || dev.username || "U"}
                    src={dev.avatarUrl}
                    size={28}
                  />
                  <span className="flex-1 font-grot font-bold text-[13px] text-cream truncate">
                    {dev.fullName || dev.username}
                  </span>
                  <span className="font-boldonse text-[13px] text-cream">
                    {dev.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <Doodle.ArrowSquiggle
              w={50}
              h={16}
              className="mt-3 ml-auto block text-orange"
              aria-hidden
            />
          </Sticker>

          {/* Right — feed post preview */}
          <Sticker
            color="cream"
            tilt={2}
            padding="lg"
            radius="xl"
            className="relative"
          >
            <Tape color="tape" size="md" tilt={5} className="-top-[10px] left-10" />
            <div className="flex items-center gap-3 mb-3.5">
              <UserAvatar name="Lena" size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-grot font-extrabold text-[15px] flex items-center gap-1.5">
                  Lena Marić
                  <span className="rounded-[4px] bg-orange text-cream font-mono-jb text-[8px] font-bold px-1.5 py-px">
                    T1
                  </span>
                </div>
                <div className="font-mono-jb text-[9px] uppercase tracking-[0.08em] text-muted-cream">
                  @lenam · shipping CRDTSync · 8m
                </div>
              </div>
              <span className="rounded-md bg-orange text-cream font-mono-jb text-[9px] font-bold tracking-[0.05em] px-2 py-1">
                +30 PTS
              </span>
            </div>
            <p className="font-grot font-semibold text-[16px] leading-[1.4] mb-3.5">
              shipped offline-first sync.{" "}
              <span className="text-orange">conflict resolution</span> is wild when
              you actually have to handle out-of-order ops.
            </p>
            <div className="rounded-xl bg-ink text-cream p-3.5 font-mono-jb text-[11px] leading-[1.6]">
              <div>
                <span className="text-muted-ink">1</span>{"  "}
                <span className="text-orange-2">const</span>{" "}
                <span className="text-tape">merge</span> = (a, b) ={">"} {"{"}
              </div>
              <div>
                <span className="text-muted-ink">2</span>{"    "}
                <span className="text-orange">// reconcile vector clocks</span>
              </div>
              <div>
                <span className="text-muted-ink">3</span>{"    "}
                <span className="text-orange-2">if</span> (a.clock {">"} b.clock){" "}
                <span className="text-orange-2">return</span> a;
              </div>
            </div>
            <div className="flex gap-5 mt-3.5 font-mono-jb text-[12px]">
              <span className="inline-flex items-center gap-1.5">
                <Doodle.Heart size={12} className="text-orange" /> 124
              </span>
              <span className="text-muted-cream">↻ 38</span>
              <span className="text-muted-cream">✦ 22</span>
            </div>
          </Sticker>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
