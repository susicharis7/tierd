import { Sticker, Tape } from "../../../components/tierd";
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
  return (
    <aside className="hidden lg:block space-y-5 lg:sticky lg:top-[160px] self-start">
      {userId && currentProfile ? (
        <MiniProfileCard profile={currentProfile} userId={userId} />
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

      <CommunitiesPanel isLoggedIn={!!userId} />

      {userId && <NextTierNudge userId={userId} />}
    </aside>
  );
}

function NextTierNudge({ userId }: { userId: string }) {
  const progressQuery = useProfileProgressQuery(userId);
  const progress = progressQuery.data;
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
