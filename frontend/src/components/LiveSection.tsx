import { Link } from "react-router-dom";

import {
  Doodle,
  MonoCaption,
  Sticker,
  StickerBadge,
  Tape,
  UserAvatar,
} from "./tierd";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonLine,
} from "./ui/loading";
import { useDelayedPending } from "../hooks/useDelayedPending";
import { cn } from "../lib/utils";
import {
  useActiveChallengeQuery,
  useRisingDevelopersQuery,
} from "../features/rankingFeatures/useRankingData";

const tilts = [-1, 0.5, -0.5, 1, -0.8, 0.3];

type ActivityPlaceholder = {
  who: string;
  tag: string;
  what: string;
  pts: string;
  when: string;
  big?: boolean;
};

const activityPlaceholders: readonly ActivityPlaceholder[] = [
  {
    who: "Dino B.",
    tag: "shipped",
    what: "neuralquery v2 — semantic search in 200 lines.",
    pts: "+30",
    when: "2m",
  },
  {
    who: "Mia V.",
    tag: "won",
    what: '"CLI Speedrun" challenge with tierd-cli.',
    pts: "+120",
    when: "12m",
  },
  {
    who: "Amir H.",
    tag: "merged",
    what: "4 PRs to rust-lang/rust this week.",
    pts: "+80",
    when: "34m",
  },
  {
    who: "Sara K.",
    tag: "tier up",
    what: "just hit T1 Shipper. earned in 11 weeks.",
    pts: "↑",
    when: "2h",
    big: true,
  },
  {
    who: "Haris S.",
    tag: "starred",
    what: "CRDTSync now at 342 ⭐ — top trending repo.",
    pts: "+15",
    when: "3h",
  },
];

function formatTimeLeft(endsAtIso: string): string {
  const now = Date.now();
  const end = new Date(endsAtIso).getTime();
  const diffMs = Math.max(0, end - now);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}

const LiveSection = () => {
  const risingQuery = useRisingDevelopersQuery(3);
  const activeChallengeQuery = useActiveChallengeQuery();
  const risingDevs = risingQuery.data ?? [];
  const activeChallenge = activeChallengeQuery.data;
  const showRisingSkeleton = useDelayedPending(risingQuery.isPending && risingDevs.length === 0);
  const showChallengeSkeleton = useDelayedPending(activeChallengeQuery.isPending);

  return (
    <section className="relative py-24 border-t border-dashed border-cream/10 bg-cream/[0.02]">
      <div className="section-container">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-9">
          <div className="flex items-center gap-3.5">
            <Doodle.Pulse size={20} className="text-orange" />
            <h2 className="font-boldonse text-3xl sm:text-[32px] text-cream leading-none">
              live feed
            </h2>
            <span className="inline-flex items-center gap-1.5 font-mono-jb text-[11px] text-forest uppercase tracking-[0.1em]">
              <span className="w-2 h-2 rounded-full bg-forest shadow-[0_0_8px_currentColor] animate-pulse" />
              streaming now
            </span>
          </div>
          <Link
            to="/explore"
            className="font-mono-jb text-[12px] uppercase tracking-[0.1em] text-cream/70 hover:text-cream transition-colors inline-flex items-center gap-1.5"
          >
            // last 24h →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity cards (preserves the "feed" intent of the original posts) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activityPlaceholders.map((a, i) => (
              <div
                key={a.who}
                className={cn(
                  "relative rounded-[16px] p-[18px] border",
                  a.big
                    ? "bg-orange text-cream border-transparent shadow-glow-orange"
                    : "bg-ink-2 text-cream border-ink-line",
                )}
                style={{ transform: `rotate(${tilts[i % tilts.length]}deg)` }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <UserAvatar name={a.who} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="font-grot font-extrabold text-[13px] truncate">
                      {a.who}
                    </div>
                    <div className="font-mono-jb text-[9px] tracking-[0.08em] uppercase">
                      <span
                        className={cn(
                          "font-bold",
                          a.big ? "text-cream" : "text-orange",
                        )}
                      >
                        {a.tag}
                      </span>
                      <span
                        className={a.big ? "text-cream/70" : "text-muted-ink"}
                      >
                        {" "}
                        · {a.when} ago
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-md font-mono-jb text-[10px] font-bold px-2 py-0.5",
                      a.big
                        ? "bg-cream text-orange"
                        : "bg-orange/15 text-orange-2",
                    )}
                  >
                    {a.pts}
                  </span>
                </div>
                <p className="font-grot font-medium text-[14px] leading-[1.45]">
                  {a.what}
                </p>
              </div>
            ))}
          </div>

          {/* Right column — rising + active challenge */}
          <div className="space-y-5">
            <Sticker
              color="cream"
              tilt={-1}
              padding="lg"
              radius="lg"
              className="relative"
            >
              <Tape
                color="tape"
                size="sm"
                tilt={-4}
                className="-top-[10px] left-8"
              />
              <MonoCaption tone="muted" className="mb-3.5">
                // rising builders
              </MonoCaption>
              <div className="space-y-3">
                {showRisingSkeleton ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3" aria-hidden="true">
                      <SkeletonLine tone="light" className="h-5 w-5" />
                      <SkeletonAvatar tone="light" className="h-8 w-8" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <SkeletonLine tone="light" className="h-3.5 w-24" />
                        <SkeletonLine tone="light" className="h-2.5 w-16" />
                      </div>
                      <div className="space-y-2">
                        <SkeletonLine tone="light" className="h-3.5 w-12" />
                        <SkeletonLine tone="light" className="h-2.5 w-8" />
                      </div>
                    </div>
                  ))
                ) : risingDevs.map((dev, i) => (
                  <div
                    key={`${dev.profileId}-${dev.rank}`}
                    className="flex items-center gap-3"
                  >
                    <span className="font-boldonse text-[16px] text-orange min-w-[18px]">
                      0{i + 1}
                    </span>
                    <UserAvatar
                      name={dev.fullName || dev.username || "U"}
                      src={dev.avatarUrl}
                      size={32}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-grot font-bold text-[14px] text-ink truncate">
                        {dev.fullName}
                      </p>
                      <p className="font-mono-jb text-[10px] uppercase tracking-[0.06em] text-muted-cream truncate">
                        @{dev.username}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-boldonse text-[14px] text-ink">
                        {dev.score.toLocaleString()}
                      </div>
                      <div className="font-mono-jb text-[10px] font-bold text-forest">
                        {dev.delta >= 0 ? "↑ +" : "↓ "}
                        {dev.delta}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Sticker>

            <div className="relative rounded-[18px] bg-ink-2 border border-ink-line p-5">
              <div className="flex items-center justify-between mb-3.5">
                <MonoCaption tone="cream">// active challenge</MonoCaption>
                <StickerBadge color="tape" className="text-[9px] px-2 py-1">
                  LIVE NOW
                </StickerBadge>
              </div>
              {showChallengeSkeleton ? (
                <div className="mb-4 space-y-3" aria-hidden="true">
                  <SkeletonLine className="h-5 w-48" />
                  <SkeletonLine className="h-3 w-full" />
                  <SkeletonLine className="h-3 w-4/5" />
                  <div className="flex items-center justify-between">
                    <SkeletonLine className="h-3 w-16" />
                    <SkeletonLine className="h-3 w-20" />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-grot font-extrabold text-[18px] text-cream leading-tight mb-2">
                    {activeChallenge?.title ?? "No active challenge"}
                  </h3>
                  <p className="font-mono-jb text-[12px] text-muted-ink leading-[1.6] mb-4">
                    {activeChallenge?.description ??
                      "Challenges will appear here when published and active."}
                  </p>
                  <div className="flex items-center justify-between text-[11px] mb-4">
                    <span className="font-mono-jb text-orange font-bold">
                      +{activeChallenge?.rewardPoints ?? 0} PTS
                    </span>
                    <span className="font-mono-jb text-muted-ink">
                      {activeChallenge
                        ? `ends in ${formatTimeLeft(activeChallenge.endsAt)}`
                        : "no timer"}
                    </span>
                  </div>
                </>
              )}
              <Link
                to="/challenges"
                className="block w-full text-center rounded-full bg-cream text-ink font-mono-jb text-[12px] font-bold px-4 py-2.5 shadow-press hover:translate-y-px transition-transform"
              >
                {showChallengeSkeleton ? <SkeletonButton tone="light" className="mx-auto h-4 w-28" /> : "join challenge →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSection;
