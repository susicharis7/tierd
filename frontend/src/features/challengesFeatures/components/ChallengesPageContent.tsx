import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  Doodle,
  MonoCaption,
  StickerBadge,
} from "../../../components/tierd";
import {
  SkeletonButton,
  SkeletonLine,
} from "../../../components/ui/loading";
import { useAuth } from "../../authFeatures/AuthProvider";
import { cn } from "../../../lib/utils";
import { useActiveChallengeQuery } from "../../rankingFeatures/useRankingData";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import {
  useChallengesOverviewQuery,
  useJoinChallengeMutation,
  useMyActiveChallengeQuery,
} from "../useChallengesData";
import type { ChallengePhase } from "../../../repositories/challengeRepository";
import ChallengeCard, { ChallengeCardSkeleton } from "./ChallengeCard";
import ChallengesHero from "./ChallengesHero";
import FeaturedChallenge from "./FeaturedChallenge";
import TopChallengersCard from "./TopChallengersCard";

const CARD_TILTS = [-0.5, 0.5, -0.3, 0.4, -0.6, 0.7];

type ChallengeTab = "Active" | "Upcoming" | "Past";

const TAB_TO_PHASE: Record<ChallengeTab, ChallengePhase> = {
  Active: "active",
  Upcoming: "upcoming",
  Past: "past",
};

const ChallengesPageContent = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<ChallengeTab>("Active");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const featuredQuery = useActiveChallengeQuery();
  const activeCountQuery = useChallengesOverviewQuery("active", 100);
  const tabPhase = TAB_TO_PHASE[activeTab];
  const overviewQuery = useChallengesOverviewQuery(tabPhase, 60);
  const myActiveChallengeQuery = useMyActiveChallengeQuery(userId);
  const joinMutation = useJoinChallengeMutation(userId);

  const rows = useMemo(() => overviewQuery.data ?? [], [overviewQuery.data]);
  const showGridSkeleton = useDelayedPending(
    overviewQuery.isPending && rows.length === 0,
  );
  const showMyChallengeSkeleton = useDelayedPending(
    Boolean(userId) && myActiveChallengeQuery.isPending,
  );

  const categories = useMemo(() => {
    const unique = new Set(rows.map((row) => row.category).filter(Boolean));
    return Array.from(unique).slice(0, 8);
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!activeCategory) return rows;
    return rows.filter((row) => row.category === activeCategory);
  }, [rows, activeCategory]);

  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative overflow-hidden">
      <Navbar />

      <div className="section-container pt-28 pb-16 relative">
        <ChallengesHero
          activeCount={activeCountQuery.data?.length ?? 0}
          totalParticipants={`${(activeCountQuery.data ?? []).reduce((acc, row) => acc + row.participants_count, 0).toLocaleString()}+`}
        />

        <FeaturedChallenge
          challenge={featuredQuery.data}
          isPending={featuredQuery.isPending}
        />

        <TabsAndFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div id="challenges-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {showGridSkeleton && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <ChallengeCardSkeleton key={i} tilt={CARD_TILTS[i % CARD_TILTS.length]} />
              ))}
            </>
          )}

          {overviewQuery.isPending && rows.length === 0 && !showGridSkeleton && (
            <div className="col-span-full min-h-[260px]" aria-hidden />
          )}

          {!overviewQuery.isPending && filteredRows.length === 0 && (
            <div className="col-span-full rounded-[18px] border border-dashed border-cream/20 bg-cream/[0.03] p-8 text-center">
              <p className="font-grot font-extrabold text-[20px] text-cream mb-2">No challenges in this view</p>
              <p className="font-mono-jb text-[12px] text-muted-ink">Switch tab or category to see more challenges.</p>
            </div>
          )}

          {!showGridSkeleton && filteredRows.map((challenge, i) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              tilt={CARD_TILTS[i % CARD_TILTS.length]}
              isJoined={myActiveChallengeQuery.data?.id === challenge.id}
              joinPending={joinMutation.isPending && joinMutation.variables === challenge.id}
              onJoin={(challengeId) => joinMutation.mutate(challengeId)}
            />
          ))}
        </div>

        <section className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopChallengersCard limit={8} />

          <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Doodle.Pulse size={16} className="text-orange" />
              <MonoCaption tone="cream">// YOUR CHALLENGE STATE</MonoCaption>
            </div>
            {userId ? (
              showMyChallengeSkeleton ? (
                <div aria-hidden="true">
                  <SkeletonLine className="h-5 w-56 max-w-full" />
                  <SkeletonLine className="mt-3 h-3 w-full" />
                  <SkeletonLine className="mt-2 h-3 w-4/5" />
                  <SkeletonButton className="mt-4 h-9 w-32" />
                </div>
              ) : myActiveChallengeQuery.data ? (
                <div>
                  <p className="font-grot font-extrabold text-[20px] text-cream leading-tight">
                    {myActiveChallengeQuery.data.title}
                  </p>
                  <p className="font-mono-jb text-[12px] text-muted-ink mt-2 leading-[1.6]">
                    You are currently in this challenge. Countdown is active until it ends.
                  </p>
                  <Link
                    to={`/challenges/${myActiveChallengeQuery.data.id}`}
                    className="inline-flex mt-4 rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2"
                  >
                    open challenge
                  </Link>
                </div>
              ) : (
                <p className="font-mono-jb text-[12px] text-muted-ink">No active challenges joined yet.</p>
              )
            ) : (
              <p className="font-mono-jb text-[12px] text-muted-ink">Log in to join and track challenges.</p>
            )}
          </div>
        </section>

        <section className="mt-20 text-center">
          <StickerBadge color="orange" tilt={-2} icon={<Doodle.Bolt size={11} />}>
            your move
          </StickerBadge>
          <h2 className="font-boldonse text-[44px] sm:text-[64px] lg:text-[88px] leading-[0.95] tracking-[-0.02em] text-cream mt-6">
            complete <span className="text-orange">challenges.</span>
            <br />
            earn proof. <span className="text-orange">move up.</span>
          </h2>
        </section>
      </div>

      <Footer />
    </div>
  );
};

interface TabsAndFiltersProps {
  activeTab: ChallengeTab;
  onTabChange: (tab: ChallengeTab) => void;
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

function TabsAndFilters({
  activeTab,
  onTabChange,
  categories,
  activeCategory,
  onCategoryChange,
}: TabsAndFiltersProps) {
  const tabs: ChallengeTab[] = ["Active", "Upcoming", "Past"];

  return (
    <div className="flex items-center justify-between flex-wrap gap-5 mb-7">
      <div className="flex items-center gap-1 flex-wrap">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono-jb text-[13px] font-bold transition-colors",
                active
                  ? "bg-cream text-ink"
                  : "bg-transparent text-cream hover:bg-cream/[0.05]",
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(active ? null : category)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-mono-jb text-[11px] font-medium transition-colors border border-dashed",
                active
                  ? "bg-cream text-ink border-cream"
                  : "bg-transparent text-cream border-cream/25 hover:border-cream/45",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChallengesPageContent;
