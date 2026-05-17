import { useMemo, useState } from "react";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  Doodle,
  MonoCaption,
  Sticker,
  StickerBadge,
  Tape,
  UserAvatar,
} from "../../../components/tierd";
import { cn } from "../../../lib/utils";
import { useActiveChallengeQuery } from "../../rankingFeatures/useRankingData";
import {
  CATEGORIES,
  TABS,
  challengesGridMock,
  pastWinnersMock,
  type ChallengeCategory,
  type ChallengeTab,
} from "../challengesData";
import ChallengeCard from "./ChallengeCard";
import ChallengesHero from "./ChallengesHero";
import FeaturedChallenge from "./FeaturedChallenge";
import TopChallengersCard from "./TopChallengersCard";

// Stable per-position card tilts (-1° to +1°). Mobile rotates less by design.
const CARD_TILTS = [-0.5, 0.5, -0.3, 0.4, -0.6, 0.7];

const whyChallenges = [
  {
    icon: Doodle.Bolt,
    title: "Earn Tier Points",
    description:
      "Every challenge completed adds to your public score and pushes you up the leaderboard.",
    accent: "orange" as const,
  },
  {
    icon: Doodle.Trophy,
    title: "Unlock Badges",
    description:
      "Win challenges to earn exclusive badges displayed on your profile forever.",
    accent: "plum" as const,
  },
  {
    icon: Doodle.Sparkle,
    title: "Get Featured Publicly",
    description:
      "Top performers are showcased on the homepage, leaderboard, and social feeds.",
    accent: "tape" as const,
  },
  {
    icon: Doodle.ArrowSquiggle,
    title: "Climb Regional Leaderboards",
    description:
      "Dominate your local scene and become the top builder in your region.",
    accent: "forest" as const,
  },
];

const WHY_ACCENT: Record<"orange" | "plum" | "tape" | "forest", string> = {
  orange: "bg-orange text-cream",
  plum: "bg-plum text-cream",
  tape: "bg-tape text-ink",
  forest: "bg-forest text-cream",
};

const ChallengesPageContent = () => {
  const [activeTab, setActiveTab] = useState<ChallengeTab>("Active");
  const [activeCat, setActiveCat] = useState<ChallengeCategory | null>(null);

  const featuredQuery = useActiveChallengeQuery();

  const filtered = useMemo(
    () =>
      activeCat
        ? challengesGridMock.filter((c) => c.category === activeCat)
        : challengesGridMock,
    [activeCat],
  );

  // The "ACTIVE CHALLENGES" stat uses the Active-tab count from `TABS`; if the
  // ranking API ever exposes a real count, swap this for that value.
  const activeCount = TABS.find((t) => t.l === "Active")?.n ?? filtered.length;

  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative overflow-hidden">
      <Navbar />

      <div className="section-container pt-28 pb-16 relative">
        <PageDoodles />

        <ChallengesHero
          activeCount={activeCount}
          totalParticipants="2,340+"
        />

        <FeaturedChallenge
          challenge={featuredQuery.data}
          isPending={featuredQuery.isPending}
        />

        <ChallengesTabsAndFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCat={activeCat}
          onCatChange={setActiveCat}
        />

        <div
          id="challenges-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((c, i) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              tilt={CARD_TILTS[i % CARD_TILTS.length]}
            />
          ))}
        </div>

        <div className="mt-9 text-center">
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-dashed border-cream/25 text-cream font-mono-jb text-[13px] font-semibold px-7 py-3.5 hover:border-cream/45 transition-colors"
          >
            load 10 more challenges ↓
          </button>
        </div>

        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopChallengersCard limit={5} />
          <RecentWinnersCard />
        </section>

        <HallOfProof />

        <section className="mt-20">
          <div className="mb-7">
            <StickerBadge color="cream" tilt={-2} className="mb-3">
              why bother?
            </StickerBadge>
            <h2 className="font-boldonse text-[40px] sm:text-[52px] leading-[0.95] text-cream">
              why challenges <span className="text-orange">matter.</span>
            </h2>
            <p className="font-mono-jb text-[12px] text-muted-ink mt-3 max-w-[480px] leading-[1.6]">
              Challenges are how you turn effort into proof — and proof into rank.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyChallenges.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="relative rounded-[16px] bg-ink-2 border border-ink-line p-6 pt-9"
                  style={{
                    transform: `rotate(${CARD_TILTS[i % CARD_TILTS.length]}deg)`,
                  }}
                >
                  <div
                    className={cn(
                      "absolute -top-4 left-5 w-10 h-10 rounded-xl flex items-center justify-center shadow-press",
                      WHY_ACCENT[c.accent],
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 className="font-grot font-extrabold text-[16px] text-cream mb-2 leading-[1.2]">
                    {c.title}
                  </h3>
                  <p className="font-mono-jb text-[12px] text-muted-ink leading-[1.6]">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <FinalCTA />
      </div>

      <Footer />
    </div>
  );
};

/* ─── inline subsections ─────────────────────────────────────────────────── */

const PageDoodles = () => (
  <>
    <Doodle.Trophy
      size={80}
      className="absolute top-16 right-12 text-orange/20 hidden lg:block pointer-events-none"
      aria-hidden
    />
    <Doodle.Sparkle
      size={20}
      className="absolute top-[220px] right-[200px] text-tape hidden lg:block pointer-events-none"
      aria-hidden
    />
    <Doodle.Asterisk
      size={32}
      className="absolute top-[120px] right-[380px] text-orange/60 hidden xl:block pointer-events-none"
      aria-hidden
    />
  </>
);

interface TabsProps {
  activeTab: ChallengeTab;
  onTabChange: (tab: ChallengeTab) => void;
  activeCat: ChallengeCategory | null;
  onCatChange: (cat: ChallengeCategory | null) => void;
}

const ChallengesTabsAndFilters = ({
  activeTab,
  onTabChange,
  activeCat,
  onCatChange,
}: TabsProps) => (
  <div className="flex items-center justify-between flex-wrap gap-5 mb-7">
    <div className="flex items-center gap-1 flex-wrap">
      {TABS.map((t) => {
        const active = activeTab === t.l;
        return (
          <button
            key={t.l}
            type="button"
            onClick={() => onTabChange(t.l)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono-jb text-[13px] font-bold transition-colors",
              active
                ? "bg-cream text-ink"
                : "bg-transparent text-cream hover:bg-cream/[0.05]",
            )}
          >
            {t.l}
            <span className="opacity-60 text-[10px] font-normal">({t.n})</span>
          </button>
        );
      })}
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      {CATEGORIES.map((c) => {
        const active = activeCat === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onCatChange(active ? null : c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono-jb text-[11px] font-medium transition-colors border-[1px] border-dashed",
              active
                ? "bg-cream text-ink border-cream"
                : "bg-transparent text-cream border-cream/25 hover:border-cream/45",
            )}
          >
            {c}
          </button>
        );
      })}
    </div>
  </div>
);

const RecentWinnersCard = () => (
  <Sticker color="cream" tilt={-1} padding="lg" radius="lg" className="relative">
    <Tape color="tape" size="sm" tilt={-4} className="-top-[10px] left-10" />
    <div className="flex items-center gap-2 mb-5">
      <Doodle.Sparkle size={16} className="text-orange" />
      <MonoCaption tone="muted">// RECENT WINNERS</MonoCaption>
    </div>
    <div className="space-y-3.5">
      {pastWinnersMock.slice(0, 3).map((w) => (
        <div key={w.handle} className="flex items-start gap-3">
          <UserAvatar name={w.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-grot font-bold text-[14px] text-ink truncate">
              {w.name}
            </p>
            <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-cream truncate">
              {w.handle} · {w.challenge}
            </p>
          </div>
          <span className="rounded-md bg-orange/15 text-orange font-mono-jb text-[10px] font-bold px-2 py-0.5">
            {w.badge}
          </span>
        </div>
      ))}
    </div>
  </Sticker>
);

const HallOfProof = () => (
  <section className="mt-20">
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div>
        <StickerBadge color="plum" tilt={-2} className="mb-3">
          hall of proof
        </StickerBadge>
        <h2 className="font-boldonse text-[40px] sm:text-[52px] leading-[0.95] text-cream">
          previous <span className="text-orange">winners.</span>
        </h2>
      </div>
      <p className="font-mono-jb text-[12px] text-muted-ink max-w-[320px] leading-[1.6]">
        The receipts. What they built, where they're from, and what it earned
        them.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {pastWinnersMock.map((w, i) => (
        <div
          key={w.handle}
          className="relative rounded-[16px] bg-ink-2 border border-ink-line p-5"
          style={{ transform: `rotate(${CARD_TILTS[i % CARD_TILTS.length]}deg)` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name={w.name} size={40} />
            <div className="min-w-0">
              <p className="font-grot font-bold text-[14px] text-cream truncate">
                {w.name}
              </p>
              <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink">
                📍 {w.location}
              </p>
            </div>
          </div>
          <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink mb-3">
            {w.handle}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-orange/15 text-orange font-mono-jb text-[10px] font-bold px-2 py-0.5">
              <Doodle.Trophy size={9} /> {w.badge}
            </span>
            <span className="font-mono-jb text-[10px] text-muted-ink">
              score {w.score}
            </span>
          </div>
          <p className="font-grot font-bold text-[13px] text-cream mb-1">
            {w.challenge}
          </p>
          <p className="font-mono-jb text-[11px] text-muted-ink leading-[1.55]">
            {w.summary}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="mt-20 text-center relative">
    <Doodle.Mountains
      w={680}
      h={200}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-orange/[0.08] hidden lg:block pointer-events-none"
      aria-hidden
    />
    <div className="relative">
      <StickerBadge
        color="orange"
        tilt={-2}
        icon={<Doodle.Bolt size={11} />}
      >
        your move
      </StickerBadge>
      <h2 className="font-boldonse text-[44px] sm:text-[64px] lg:text-[88px] leading-[0.95] tracking-[-0.02em] text-cream mt-6">
        complete <span className="text-orange">challenges.</span>
        <br />
        earn proof. <span className="text-orange">move up.</span>
      </h2>
      <p className="font-mono-jb text-[13px] text-cream/75 mt-5 max-w-[480px] mx-auto leading-[1.6]">
        Your rank is built on what you ship. Start proving it today.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 shadow-cta-orange hover:translate-y-px transition-transform"
        >
          <Doodle.Bolt size={14} />
          join Tierd.
        </button>
        <a
          href="/leaderboard"
          className="inline-flex items-center rounded-full border-[1.5px] border-dashed border-cream/30 text-cream font-mono-jb text-[13px] font-bold px-7 py-3.5 hover:border-cream/50 transition-colors"
        >
          explore leaderboard →
        </a>
      </div>
    </div>
  </section>
);

export default ChallengesPageContent;
