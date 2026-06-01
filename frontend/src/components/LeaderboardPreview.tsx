import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Doodle,
  MonoCaption,
  StickerBadge,
  TierBadge,
  UserAvatar,
} from "./tierd";
import { cn } from "../lib/utils";
import { useLandingTopBuildersQuery } from "../features/rankingFeatures/useRankingData";
import { mapTierToBadge } from "../features/rankingFeatures/tierMapping";

const tabs = ["Global", "AI", "Web", "Game Dev"] as const;
const tabDot: Record<(typeof tabs)[number], string> = {
  Global: "bg-orange",
  AI: "bg-plum",
  Web: "bg-forest",
  "Game Dev": "bg-orange-2",
};

const LeaderboardPreview = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Global");
  const leaderboardQuery = useLandingTopBuildersQuery(8);
  const leaderboard = leaderboardQuery.data ?? [];

  return (
    <section className="relative py-24">
      <Doodle.Mountains
        w={520}
        h={180}
        className="absolute top-10 right-0 text-orange/15 hidden lg:block pointer-events-none"
        aria-hidden
      />
      <div className="section-container relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <StickerBadge
              color="plum"
              tilt={-2}
              icon={<Doodle.Trophy size={11} />}
              className="mb-4"
            >
              this week
            </StickerBadge>
            <h2 className="font-boldonse text-[44px] sm:text-[56px] leading-[0.95] text-cream">
              climb the <span className="text-orange">leaderboard.</span>
            </h2>
            <p className="font-mono-jb text-[13px] text-muted-ink mt-3 max-w-[460px] leading-[1.6]">
              A public score for private effort. Score weights real signals - code
              quality, consistency, OSS impact - over follower count.
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="self-start sm:self-end rounded-full border border-dashed border-cream/30 text-cream font-mono-jb text-[12px] font-bold px-5 py-2.5 hover:border-cream/50 transition-colors inline-flex items-center gap-2"
          >
            view full leaderboard {"->"}
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-7">
          <MonoCaption tone="muted" className="mr-1.5">
            FILTER:
          </MonoCaption>
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono-jb text-[12px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-cream text-ink"
                    : "bg-transparent text-cream border border-cream/15 hover:border-cream/30",
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", tabDot[tab])} />
                {tab}
              </button>
            );
          })}
        </div>

        <div className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-2">
          <div className="hidden sm:grid grid-cols-[60px_1fr_120px_110px_120px] gap-x-4 items-center px-4 py-3 border-b border-dashed border-cream/10">
            {["#", "Developer", "Scope", "Tier"].map((h) => (
              <MonoCaption key={h} tone="muted">
                {h}
              </MonoCaption>
            ))}
            <MonoCaption tone="muted" className="justify-end">
              Score
            </MonoCaption>
          </div>

          {leaderboardQuery.isPending && (
            <div className="px-5 py-10 font-mono-jb text-[13px] text-muted-ink">
              Loading leaderboard...
            </div>
          )}

          {!leaderboardQuery.isPending && leaderboard.length === 0 && (
            <div className="px-5 py-10 font-mono-jb text-[13px] text-muted-ink">
              No leaderboard data yet.
            </div>
          )}

          {leaderboard.map((dev, i) => {
            const tier = mapTierToBadge(dev.tierCode ?? dev.tier);
            const isLast = i === leaderboard.length - 1;
            const topThree = dev.rank <= 3;
            return (
              <div
                key={`${dev.profileId}-${dev.rank}`}
                className={cn(
                  "grid grid-cols-[40px_1fr_auto] sm:grid-cols-[60px_1fr_120px_110px_120px] gap-x-4 items-center px-4 py-3.5 transition-colors hover:bg-cream/[0.03]",
                  !isLast && "border-b border-dashed border-cream/[0.06]",
                )}
              >
                <div
                  className={cn(
                    "font-boldonse text-[20px]",
                    topThree ? "text-orange" : "text-cream/60",
                  )}
                >
                  0{dev.rank}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    name={dev.fullName || dev.username || "U"}
                    src={dev.avatarUrl}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="font-grot font-bold text-[14px] text-cream truncate">
                      {dev.fullName}
                    </p>
                    <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink truncate">
                      @{dev.username}
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 font-mono-jb text-[12px] text-cream">
                  <span className={cn("w-[5px] h-[5px] rounded-full", tabDot[activeTab])} />
                  {activeTab}
                </span>
                <span className="hidden sm:block">
                  <TierBadge tier={tier} size="sm" />
                </span>
                <div className="text-right">
                  <div className="font-boldonse text-[16px] text-cream">
                    {dev.score.toLocaleString()}
                  </div>
                  <div className="font-mono-jb text-[10px] font-bold text-forest">
                    {dev.delta >= 0 ? "up +" : "down "}
                    {dev.delta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
