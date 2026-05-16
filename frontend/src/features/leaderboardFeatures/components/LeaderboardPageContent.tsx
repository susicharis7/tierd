import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { LeaderboardMotif } from "../../../components/PageBackgroundMotif";
import { useAuth } from "../../authFeatures/AuthProvider";
import { useGlobalLeaderboardQuery } from "../../rankingFeatures/useRankingData";
import type { LeaderboardEntry } from "../../../services/rankingService";

import {
  Doodle,
  DoodleAvatar,
  MonoCaption,
  Sticker,
  StickerBadge,
  Tape,
  TierBadge,
  type Tier,
} from "../../../components/tierd";
import { cn } from "../../../lib/utils";

const tabs = ["Global", "AI", "Web", "Systems", "Game Dev", "Mobile"] as const;
const tabDot: Record<(typeof tabs)[number], string> = {
  Global: "bg-orange",
  AI: "bg-plum",
  Web: "bg-forest",
  Systems: "bg-tape",
  "Game Dev": "bg-orange-2",
  Mobile: "bg-sage",
};

/** Normalise the API's tier string to one of our TierBadge variants. */
function toTier(raw: string | null | undefined): Tier {
  if (!raw) return "—";
  if (raw === "T0" || raw === "T1" || raw === "T2" || raw === "T3") return raw;
  return "—";
}

const LeaderboardPageContent = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Global");
  const leaderboardQuery = useGlobalLeaderboardQuery(50);
  const { userId } = useAuth();

  const developers = useMemo(
    () => leaderboardQuery.data ?? [],
    [leaderboardQuery.data],
  );
  const top3 = developers.slice(0, 3);
  const hasPodium = top3.length === 3;
  const currentUser = useMemo(
    () => (userId ? developers.find((d) => d.profileId === userId) ?? null : null),
    [developers, userId],
  );
  const pointsBehindFirst =
    currentUser && developers[0] ? developers[0].score - currentUser.score : null;

  return (
    <div className="min-h-screen bg-background text-cream font-grot relative">
      <LeaderboardMotif />
      <Navbar />

      <div className="section-container pt-24 pb-16 relative">
        <Doodle.Mountains
          w={520}
          h={180}
          className="absolute top-[70px] right-0 text-orange/20 hidden lg:block pointer-events-none"
          aria-hidden
        />
        <Doodle.Asterisk
          size={36}
          className="absolute top-[180px] right-[80px] text-orange/70 hidden lg:block pointer-events-none"
          aria-hidden
        />
        <Doodle.Dots
          rows={3}
          cols={10}
          className="absolute top-[110px] left-[640px] text-cream/20 hidden xl:block pointer-events-none"
          aria-hidden
        />

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between gap-6 flex-wrap mb-10"
        >
          <div className="max-w-2xl">
            <StickerBadge
              color="orange"
              tilt={-2}
              icon={<Doodle.Trophy size={12} />}
              className="mb-4"
            >
              weekly leaderboard
            </StickerBadge>
            <h1 className="font-boldonse text-[56px] sm:text-[72px] lg:text-[92px] leading-[0.95] tracking-[-0.02em] text-cream">
              leader<span className="text-orange">board.</span>
            </h1>
            <p className="font-mono-jb text-[13px] sm:text-[14px] text-cream/70 mt-4 max-w-[560px] leading-[1.6]">
              A global score for private effort. Updated in near real-time.
              Climb the ladder by shipping, starring, and showing up.
            </p>
          </div>

          {currentUser && (
            <Sticker
              color="cream"
              tilt={2}
              padding="md"
              radius="lg"
              className="min-w-[220px]"
            >
              <Tape color="tape" size="sm" tilt={-4} className="-top-[10px] left-10" />
              <MonoCaption tone="muted" className="text-[9px]">
                YOUR RANK
              </MonoCaption>
              <div className="flex items-baseline gap-2 mt-1.5">
                <div className="font-boldonse text-[38px] text-ink leading-none">
                  #{currentUser.rank}
                </div>
                <span className="font-mono-jb text-[11px] text-forest font-bold">
                  {currentUser.delta >= 0 ? "↑" : "↓"} {currentUser.delta >= 0 ? "+" : ""}
                  {currentUser.delta} this week
                </span>
              </div>
              <div className="my-2.5 border-t border-dashed border-ink/15" />
              <div className="font-mono-jb text-[10px] text-muted-cream">
                {pointsBehindFirst && pointsBehindFirst > 0 ? (
                  <>
                    <b className="text-orange">{pointsBehindFirst.toLocaleString()} pts</b> behind
                    #1 · keep shipping
                  </>
                ) : (
                  <b className="text-orange">you're #1 — defend it.</b>
                )}
              </div>
            </Sticker>
          )}
        </motion.header>

        <div className="flex items-center justify-between gap-6 flex-wrap mb-7">
          <div className="flex items-center gap-2 flex-wrap">
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

          {/* "THIS WEEK" / "DESC" are placeholder chips — the leaderboard API
              doesn't expose time-range or sort-direction parameters yet. */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-3 border border-ink-line px-2.5 py-1 font-mono-jb text-[11px] text-cream">
              📅 THIS WEEK
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-3 border border-ink-line px-2.5 py-1 font-mono-jb text-[11px] text-cream">
              ↓ DESC
            </span>
          </div>
        </div>

        {hasPodium && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1fr] gap-4 items-end mb-9">
            <PodiumCard dev={top3[1]} place={2} isYou={top3[1].profileId === userId} />
            <PodiumCard dev={top3[0]} place={1} isYou={top3[0].profileId === userId} />
            <PodiumCard dev={top3[2]} place={3} isYou={top3[2].profileId === userId} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[18px] bg-cream/[0.04] border border-cream/10 p-2 overflow-hidden"
        >
          <div className="hidden sm:grid grid-cols-[60px_1fr_130px_100px_110px_130px] gap-x-4 items-center px-4 py-3.5 border-b border-dashed border-cream/10">
            {["#", "Developer", "Scope", "Streak", "Tier"].map((h) => (
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

          {!leaderboardQuery.isPending && developers.length === 0 && (
            <div className="px-5 py-10 font-mono-jb text-[13px] text-muted-ink">
              No leaderboard data yet.
            </div>
          )}

          {developers.map((dev, i) => (
            <LeaderboardRow
              key={`${dev.profileId}-${dev.rank}`}
              dev={dev}
              scope={activeTab}
              isYou={dev.profileId === userId}
              isLast={i === developers.length - 1}
              index={i}
            />
          ))}
        </motion.div>

        <div className="flex items-center justify-between flex-wrap gap-4 mt-8">
          <div className="font-mono-jb text-[11px] text-muted-ink flex items-center gap-3">
            <Doodle.Asterisk size={14} className="text-orange" />
            scores recalculated every 6h
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-full border border-dashed border-cream/30 text-cream font-mono-jb text-[13px] font-semibold px-5 py-3 hover:border-cream/50 transition-colors"
            >
              see how scoring works →
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-orange text-cream font-mono-jb text-[13px] font-bold px-6 py-3 shadow-cta-orange hover:translate-y-px transition-transform"
            >
              <Doodle.Bolt size={14} />
              claim your spot
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LeaderboardPageContent;

const MEDAL = {
  1: {
    label: "👑 GOLD",
    chipBg: "bg-cream",
    chipFg: "text-ink",
  },
  2: {
    label: "● SILVER",
    chipBg: "bg-[#C0C0C0]",
    chipFg: "text-ink",
  },
  3: {
    label: "● BRONZE",
    chipBg: "bg-[#CD7F32]",
    chipFg: "text-cream",
  },
} as const;

function PodiumCard({
  dev,
  place,
  isYou,
}: {
  dev: LeaderboardEntry;
  place: 1 | 2 | 3;
  isYou: boolean;
}) {
  const medal = MEDAL[place];
  const isFirst = place === 1;
  const tier = toTier(dev.tierCode ?? dev.tier);
  const tilt = place === 1 ? 1 : place === 2 ? -2 : 2;

  return (
    <Sticker
      color={isFirst ? "orange" : place === 2 ? "cream" : "peach"}
      tilt={tilt}
      padding="md"
      radius="xl"
      className={cn(
        "h-[200px] flex flex-col justify-between",
        isFirst && "h-[230px] -translate-y-[30px] shadow-glow-orange",
      )}
    >
      <Tape
        color="tape"
        size="md"
        tilt={isFirst ? -5 : 5}
        className={cn("-top-[10px]", isFirst ? "left-8" : place === 2 ? "right-8" : "left-8")}
      />
      {isFirst && (
        <>
          <Doodle.Sparkle
            size={28}
            className="absolute top-5 right-6 text-cream pointer-events-none"
            aria-hidden
          />
          <Doodle.Sparkle
            size={16}
            className="absolute top-3.5 right-16 text-cream/70 pointer-events-none"
            aria-hidden
          />
        </>
      )}

      <div className="flex items-start justify-between">
        <div
          className={cn(
            "font-boldonse leading-[0.8]",
            isFirst ? "text-[72px] text-cream" : place === 2 ? "text-[60px] text-cream-2" : "text-[56px] text-ink/25",
          )}
        >
          {String(place).padStart(2, "0")}
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono-jb text-[9px] font-bold tracking-[0.1em]",
            medal.chipBg,
            medal.chipFg,
          )}
        >
          {medal.label}
        </span>
      </div>

      <div>
        <DoodleAvatar
          name={dev.fullName || dev.username || "U"}
          size={isFirst ? 52 : 44}
          className="mb-2.5"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={cn(
              "font-grot font-extrabold",
              isFirst ? "text-[22px] text-cream" : "text-[17px] text-ink",
            )}
          >
            {dev.fullName || dev.username}
          </div>
          {isYou && (
            <span className="rounded-[4px] bg-orange text-cream font-mono-jb text-[8px] font-bold px-1.5 py-px">
              YOU
            </span>
          )}
        </div>
        <div
          className={cn(
            "font-mono-jb text-[10px] uppercase tracking-[0.08em] mt-1",
            isFirst ? "text-cream/80" : "text-muted-cream",
          )}
        >
          @{dev.username} · TIER {tier === "—" ? "—" : tier.slice(1)}
          {dev.streakWeeks > 0 && ` · STREAK ${dev.streakWeeks}w`}
        </div>
        <div className="flex justify-between items-baseline mt-3">
          <div
            className={cn(
              "font-boldonse",
              isFirst ? "text-[32px] text-cream" : place === 2 ? "text-[24px] text-ink" : "text-[22px] text-ink",
            )}
          >
            {dev.score.toLocaleString()}
          </div>
          <div
            className={cn(
              "font-mono-jb font-bold",
              isFirst ? "text-[12px] text-cream" : "text-[11px] text-forest",
            )}
          >
            {dev.delta >= 0 ? "↑" : "↓"} {dev.delta >= 0 ? "+" : ""}
            {dev.delta}
          </div>
        </div>
      </div>
    </Sticker>
  );
}

function LeaderboardRow({
  dev,
  scope,
  isYou,
  isLast,
  index,
}: {
  dev: LeaderboardEntry;
  scope: string;
  isYou: boolean;
  isLast: boolean;
  index: number;
}) {
  const tier = toTier(dev.tierCode ?? dev.tier);
  const topThree = dev.rank <= 3;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03 }}
      className={cn(
        "grid grid-cols-[40px_1fr_auto] sm:grid-cols-[60px_1fr_130px_100px_110px_130px] gap-x-4 items-center px-4 py-4 transition-colors",
        !isYou && !isLast && "border-b border-dashed border-cream/[0.06]",
        isYou && "rounded-[14px] bg-orange/[0.07] border border-dashed border-orange",
        !isYou && "hover:bg-cream/[0.03]",
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          "font-boldonse text-[24px]",
          topThree ? "text-orange" : "text-cream/60",
        )}
      >
        {String(dev.rank).padStart(2, "0")}
      </div>

      {/* Developer */}
      <div className="flex items-center gap-3.5 min-w-0">
        <DoodleAvatar
          name={dev.fullName || dev.username || "U"}
          size={40}
          className="shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-grot font-bold text-[15px] text-cream truncate">
              {dev.fullName || dev.username}
            </span>
            {isYou && (
              <span className="rounded-[4px] bg-orange text-cream font-mono-jb text-[8px] font-bold px-1.5 py-px shrink-0">
                YOU
              </span>
            )}
          </div>
          <div className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-muted-ink truncate">
            @{dev.username}
          </div>
        </div>
      </div>

      {/* Scope */}
      <div className="hidden sm:flex items-center gap-1.5 font-mono-jb text-[12px] text-cream">
        <span className="w-[5px] h-[5px] rounded-full bg-orange" />
        {scope}
      </div>

      {/* Streak */}
      <div className="hidden sm:block font-mono-jb text-[12px] text-cream">
        <span className="text-orange mr-1" aria-hidden>
          🔥
        </span>
        {dev.streakWeeks}w
      </div>

      {/* Tier */}
      <div className="hidden sm:block">
        <TierBadge tier={tier} size="sm" />
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-boldonse text-[18px] text-cream">
          {dev.score.toLocaleString()}
        </div>
        <div className="font-mono-jb text-[10px] font-bold text-forest mt-0.5">
          {dev.delta >= 0 ? "↑" : "↓"} {dev.delta >= 0 ? "+" : ""}
          {dev.delta}
        </div>
      </div>
    </motion.div>
  );
}
