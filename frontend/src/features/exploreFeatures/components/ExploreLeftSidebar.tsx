import { Sticker, Tape } from "../../../components/tierd";
import { Link } from "react-router-dom";
import {
  SkeletonAvatar,
  SkeletonButton,
  SkeletonLine,
} from "../../../components/ui/loading";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import {
  formatChallengeStartsIn,
  formatChallengeTimeLeft,
  useMyActiveChallengeQuery,
} from "../../challengesFeatures/useChallengesData";
import { useProfileProgressQuery } from "../../rankingFeatures/useRankingData";
import {
  CommunitiesPanel,
  MiniProfileCard,
} from "./ExploreSidebarPanels";

type ExploreLeftSidebarProps = {
  userId: string | null;
  authLoading: boolean;
  currentProfile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export function ExploreLeftSidebar({
  userId,
  authLoading,
  currentProfile,
}: ExploreLeftSidebarProps) {
  const activeChallengeQuery = useMyActiveChallengeQuery(userId);
  const showChallengeSkeleton = useDelayedPending(
    Boolean(userId) && activeChallengeQuery.isPending,
  );

  const activeChallenge = activeChallengeQuery.data;
  const challengeTimer = activeChallenge
    ? activeChallenge.phase === "upcoming"
      ? formatChallengeStartsIn(activeChallenge.starts_at)
      : formatChallengeTimeLeft(activeChallenge.ends_at)
    : null;

  return (
    <aside className="hidden lg:block space-y-5 lg:sticky lg:top-[160px] self-start">
      {userId && currentProfile ? (
        <MiniProfileCard profile={currentProfile} userId={userId} />
      ) : authLoading ? (
        <div className="rounded-[14px] border border-cream/[0.08] bg-cream/[0.03] p-5" aria-hidden="true">
          <SkeletonAvatar className="mx-auto h-12 w-12" />
          <SkeletonLine className="mx-auto mt-3 h-4 w-28" />
          <SkeletonLine className="mx-auto mt-2 h-2.5 w-20" />
          <SkeletonButton className="mt-4 h-9 w-full" />
        </div>
      ) : !authLoading ? (
        <div className="rounded-[14px] border border-dashed border-cream/20 bg-cream/[0.03] p-5 text-center">
          <p className="font-grot font-extrabold text-[15px] text-cream mb-1">
            Join Tierd<span className="text-orange">.</span>
          </p>
          <p className="font-mono-jb text-[11px] text-muted-ink mb-3 leading-[1.6]">
            Create your builder identity.
          </p>
          <button
            type="button"
            className="w-full rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2.5 shadow-cta-orange hover:translate-y-px transition-transform"
          >
            sign up
          </button>
        </div>
      ) : null}

      <div className="rounded-[14px] border border-cream/[0.08] bg-cream/[0.03] p-4">
        <p className="font-mono-jb text-[10px] uppercase tracking-[0.08em] text-cream/70 mb-2">
          // challenge
        </p>
        {showChallengeSkeleton ? (
          <div className="space-y-3" aria-hidden="true">
            <SkeletonLine className="h-4 w-36" />
            <SkeletonLine className="h-3 w-24" />
            <SkeletonButton className="h-7 w-28" />
          </div>
        ) : userId && activeChallenge ? (
          <>
            <p className="font-grot font-extrabold text-[15px] text-cream leading-tight">
              {activeChallenge.title}
            </p>
            <p className="font-mono-jb text-[10px] text-muted-ink mt-2">
              {activeChallenge.phase === "upcoming" ? "starts in" : "ends in"}{" "}
              {challengeTimer ?? "-"}
            </p>
            <Link
              to={`/challenges/${activeChallenge.id}`}
              className="inline-flex mt-3 rounded-full bg-orange text-cream font-mono-jb text-[11px] font-bold px-3.5 py-1.5"
            >
              open challenge
            </Link>
          </>
        ) : (
          <p className="font-mono-jb text-[11px] text-muted-ink">
            no challenges
          </p>
        )}
      </div>

      <CommunitiesPanel isLoggedIn={!!userId} />

      {userId && <NextTierNudge userId={userId} />}
    </aside>
  );
}

function NextTierNudge({ userId }: { userId: string }) {
  const progressQuery = useProfileProgressQuery(userId);
  const progress = progressQuery.data;
  const showSkeleton = useDelayedPending(progressQuery.isPending);
  if (showSkeleton) {
    return (
      <Sticker
        color="peach"
        tilt={-1.2}
        padding="md"
        radius="md"
        className="relative !py-3.5"
      >
        <Tape color="tape" size="sm" tilt={8} className="-top-[8px] right-8" />
        <div aria-hidden="true">
          <SkeletonLine tone="light" className="h-4 w-32" />
          <SkeletonLine tone="light" className="mt-3 h-3 w-full" />
          <SkeletonLine tone="light" className="mt-2 h-3 w-3/4" />
        </div>
      </Sticker>
    );
  }
  if (!progress) return null;

  const ptsToNext = progress.pointsToNextTier;
  const nextTier = progress.nextTierName ?? progress.nextTierCode;

  return (
    <Sticker
      color="peach"
      tilt={-1.2}
      padding="md"
      radius="md"
      className="relative !py-3.5"
    >
      <Tape color="tape" size="sm" tilt={8} className="-top-[8px] right-8" />
      <p className="font-grot font-bold text-[14px] text-ink mb-1">
        ship daily, climb weekly.
      </p>
      <p className="font-mono-jb text-[11px] text-muted-cream leading-[1.5]">
        {nextTier && ptsToNext > 0 ? (
          <>
            You're <b className="text-orange">{ptsToNext.toLocaleString()} pts</b>{" "}
            away from <b className="text-orange">{nextTier}</b>. Post your build
            today to earn +30.
          </>
        ) : (
          <>
            You're <b className="text-orange">at the top</b> — defend it by
            shipping today.
          </>
        )}
      </p>
    </Sticker>
  );
}
