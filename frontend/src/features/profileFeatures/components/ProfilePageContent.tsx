import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import AuthDialog from "../../../components/AuthDialog";
import FeedImageLightbox from "../../../components/FeedImageLightbox";
import { Doodle, MonoCaption } from "../../../components/tierd";
import { toast } from "../../../components/ui/sonner";
import { useAuth } from "../../authFeatures/AuthProvider";
import { getExploreActionableMessage } from "../../exploreFeatures/exploreErrors";
import { ExplorePostCard } from "../../exploreFeatures/ExplorePostCard";
import {
  useExploreAddCommentMutation,
  useExploreCommentsQuery,
  useExploreLikeMutation,
  useProfileByUsernameQuery,
  useUserPostsInfiniteQuery,
} from "../../exploreFeatures/useExplorePageData";
import type { FeedPost, PostComment } from "../../exploreFeatures/exploreTypes";
import { useProfileProgressQuery } from "../../rankingFeatures/useRankingData";
import {
  useFollowStateQuery,
  useFollowersListQuery,
  useFollowingListQuery,
  useToggleFollowMutation,
} from "../useProfileSocialData";
import type { TechOption } from "../profileData";
import ProfileBanner from "./ProfileBanner";
import ProfileIdentityCard from "./ProfileIdentityCard";
import ProfileSecondary from "./ProfileSecondary";
import ProfileStickyRail from "./ProfileStickyRail";
import {
  EditProfileDialog,
  ProfileGuestGate,
  SocialListDialog,
  TechDialog,
} from "./ProfileDialogs";

type ProfileAuthMode = "login" | "signup";

/** Pull the last 7-day slice out of the rolling heatmap for the right-rail bars. */
const lastWeekActivity = (data: number[][]): number[] =>
  data[data.length - 1] ?? Array(7).fill(0);

/* Stable mock heatmap data, generated once per module load. */
const heatmapData = generateHeatmapData();

function generateHeatmapData(): number[][] {
  const out: number[][] = [];
  for (let w = 0; w < 52; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const base = Math.random();
      if (w > 40) week.push(base > 0.3 ? Math.ceil(Math.random() * 4) : 0);
      else if (w > 30) week.push(base > 0.5 ? Math.ceil(Math.random() * 3) : 0);
      else week.push(base > 0.6 ? Math.ceil(Math.random() * 2) : 0);
    }
    out.push(week);
  }
  return out;
}

const ProfilePageContent = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams<{ username: string }>();
  const {
    profile: authProfile,
    session,
    userId: authUserId,
    loading: authLoading,
  } = useAuth();

  const isOwnProfile = useMemo(() => {
    if (!authProfile || !routeUsername) return false;
    const clean = routeUsername.toLowerCase().replace(/^@/, "");
    return (
      clean === authProfile.username?.toLowerCase() ||
      clean === authUserId?.toLowerCase() ||
      clean === "me"
    );
  }, [authProfile, authUserId, routeUsername]);

  const externalProfileQuery = useProfileByUsernameQuery(
    isOwnProfile ? undefined : routeUsername,
  );

  const profile = isOwnProfile
    ? authProfile
    : externalProfileQuery.data ?? null;

  const resolvedUserId = isOwnProfile
    ? authUserId
    : externalProfileQuery.data?.id ?? null;

  const userPostsQuery = useUserPostsInfiniteQuery(authUserId, resolvedUserId);
  const profileProgressQuery = useProfileProgressQuery(resolvedUserId);
  const profileProgress = profileProgressQuery.data ?? null;
  const followStateQuery = useFollowStateQuery(
    authUserId,
    resolvedUserId,
    isOwnProfile,
  );
  const followMutation = useToggleFollowMutation(authUserId, resolvedUserId);

  const userPosts =
    userPostsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const postsCountLabel =
    userPosts.length === 0
      ? "0"
      : userPostsQuery.hasNextPage
        ? `${userPosts.length}+`
        : String(userPosts.length);

  /* Post-interaction state (comments + lightbox), preserved from the previous
     implementation so all wiring + Explore mutations still flow through. */
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null,
  );
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const commentsFetchPostId = lightboxPostId ?? openCommentsPostId;
  const commentsQuery = useExploreCommentsQuery(commentsFetchPostId);

  useEffect(() => {
    if (!commentsFetchPostId || !commentsQuery.isError) return;
    const err = commentsQuery.error;
    toast(getExploreActionableMessage(err) ?? "Could not load comments.");
  }, [commentsFetchPostId, commentsQuery.isError, commentsQuery.error]);

  const likeMutation = useExploreLikeMutation(authUserId);
  const commentMutation = useExploreAddCommentMutation(authUserId, authProfile);

  const commentsForActivePost = commentsFetchPostId
    ? (commentsQuery.data ?? [])
    : [];
  const commentsLoadingActive =
    Boolean(commentsFetchPostId) &&
    (commentsQuery.isPending || commentsQuery.isFetching);

  const lightboxPost = lightboxPostId
    ? userPosts.find((p) => p.id === lightboxPostId)
    : undefined;

  const handleOpenMediaLightbox = (postId: string) => {
    setOpenCommentsPostId(null);
    setCommentDraft("");
    setLightboxPostId(postId);
  };

  const handleToggleLike = (postId: string) => {
    if (!authUserId) {
      toast("Log in to like posts.");
      return;
    }
    likeMutation.mutate({ postId });
  };

  const handleToggleComments = (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      setCommentDraft("");
      return;
    }
    setOpenCommentsPostId(postId);
    setCommentDraft("");
  };

  const handleSubmitComment = (postId: string) => {
    if (!authUserId) {
      toast("Log in to comment.");
      return;
    }
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    commentMutation.mutate(
      { postId, content: trimmed },
      { onSuccess: () => setCommentDraft("") },
    );
  };

  /* UI toggles */
  const [editOpen, setEditOpen] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateMode, setAuthGateMode] = useState<ProfileAuthMode>("login");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const followersQuery = useFollowersListQuery(resolvedUserId, followersOpen);
  const followingQuery = useFollowingListQuery(resolvedUserId, followingOpen);

  const showGuestGate = !authLoading && !session;

  const displayName =
    (authLoading && isOwnProfile)
      ? "Loading…"
      : profile?.full_name?.trim() || "Your Name";
  const displayUsername =
    (authLoading && isOwnProfile)
      ? "loading"
      : profile?.username?.trim() || "your_handle";

  const profileHeadline = "Software Engineer";
  const profileLocation = "Global · BiH 🇧🇦";
  const profileBio =
    "Full-stack builder obsessed with developer tools and AI infra. Shipping every week, proving every day — performance, DX, and taste.";

  const currentTierCode = profileProgress?.tierCode ?? null;
  const currentTierName = profileProgress?.tierName ?? "Unranked";
  const currentScore = profileProgress?.totalScore ?? 0;
  const nextTierName = profileProgress?.nextTierName ?? null;
  const pointsToNextTier = profileProgress?.pointsToNextTier ?? 0;
  const progressToNext = profileProgress?.progressToNextTierPct ?? 0;
  const followersCount = profileProgress?.followersCount ?? 0;
  const followingCount = profileProgress?.followingCount ?? 0;
  const weeklyScore = profileProgress?.weeklyScore ?? 0;
  const globalPercentile = profileProgress?.globalPercentile ?? 100;
  const weekActivity = useMemo(() => lastWeekActivity(heatmapData), []);

  const [topTech, setTopTech] = useState<string[]>([
    "React",
    "TypeScript",
    "Node.js",
  ]);
  const toggleTopTech = (t: TechOption) => {
    setTopTech((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev;
      return [...prev, t];
    });
  };

  const handleToggleFollow = () => {
    if (!authUserId) {
      setAuthGateMode("login");
      setAuthGateOpen(true);
      return;
    }
    if (!resolvedUserId || isOwnProfile || followMutation.isPending) return;
    followMutation.mutate(Boolean(followStateQuery.data?.isFollowing));
  };

  return (
    <div className="min-h-screen bg-ink text-cream font-grot relative">
      <Navbar />

      {showGuestGate && (
        <ProfileGuestGate
          onAuth={(mode) => {
            setAuthGateMode(mode);
            setAuthGateOpen(true);
          }}
        />
      )}

      <div
        className={`pt-24 pb-0 relative z-10 ${showGuestGate ? "pointer-events-none select-none opacity-40" : ""}`}
      >
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-container mt-5"
        >
          <ProfileBanner isOwn={isOwnProfile} />

          <ProfileIdentityCard
            displayName={displayName}
            username={displayUsername}
            avatarUrl={profile?.avatar_url}
            headline={profileHeadline}
            location={profileLocation}
            bio={profileBio}
            bioExpanded={bioExpanded}
            onToggleBio={() => setBioExpanded((v) => !v)}
            isOwnProfile={isOwnProfile}
            isFollowing={Boolean(followStateQuery.data?.isFollowing)}
            followPending={followMutation.isPending}
            onEdit={() => setEditOpen(true)}
            onToggleFollow={handleToggleFollow}
          />
        </motion.section>

        {/* Main grid — LEFT: stats + badges + projects + posts.
            RIGHT (sticky): tier + activity + tech + endorsement. */}
        <div className="section-container pb-20 mt-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            <main className="lg:col-span-7 min-w-0 space-y-6">
              <ProfileSecondary
                postsLabel={postsCountLabel}
                followersCount={followersCount}
                followingCount={followingCount}
                currentScore={currentScore}
                onOpenFollowers={() => setFollowersOpen(true)}
                onOpenFollowing={() => setFollowingOpen(true)}
              />

              <section>
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-dashed border-cream/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Doodle.Pulse size={14} className="text-orange" />
                    <MonoCaption tone="cream">// posts</MonoCaption>
                    <span className="font-mono-jb text-[10px] text-muted-ink uppercase tracking-[0.08em]">
                      {userPostsQuery.hasNextPage
                        ? `${userPosts.length} shown · more below`
                        : `${userPosts.length} ${userPosts.length === 1 ? "post" : "posts"}`}
                    </span>
                  </div>
                </div>

                <PostsList
                  isPending={userPostsQuery.isPending}
                  isOwnProfile={isOwnProfile}
                  userPosts={userPosts}
                  openCommentsPostId={openCommentsPostId}
                  commentsFetchPostId={commentsFetchPostId}
                  commentsForActivePost={commentsForActivePost}
                  commentsLoadingActive={commentsLoadingActive}
                  commentDraft={commentDraft}
                  commentMutationPending={commentMutation.isPending}
                  commentMutationPostId={commentMutation.variables?.postId}
                  onToggleLike={handleToggleLike}
                  onToggleComments={handleToggleComments}
                  onChangeCommentDraft={setCommentDraft}
                  onSubmitComment={handleSubmitComment}
                  onOpenMediaLightbox={handleOpenMediaLightbox}
                  hasNextPage={Boolean(userPostsQuery.hasNextPage)}
                  isFetchingNextPage={userPostsQuery.isFetchingNextPage}
                  onFetchNext={() => void userPostsQuery.fetchNextPage()}
                />
              </section>
            </main>

            <aside
              className="lg:col-span-5 min-w-0 lg:sticky lg:top-[120px] self-start"
              aria-label="Tier, activity, stack, and endorsements"
            >
              <ProfileStickyRail
                tierCode={currentTierCode}
                tierName={currentTierName}
                currentScore={currentScore}
                nextTierName={nextTierName}
                pointsToNextTier={pointsToNextTier}
                progressPct={progressToNext}
                weeklyScore={weeklyScore}
                globalPercentile={globalPercentile}
                topTech={topTech}
                onEditTech={() => setTechOpen(true)}
                isOwnProfile={isOwnProfile}
                weekActivity={weekActivity}
              />
            </aside>
          </div>
        </div>
      </div>

      <Footer />

      {lightboxPost?.image_url && (
        <FeedImageLightbox
          open
          onOpenChange={(next) => {
            if (!next) setLightboxPostId(null);
          }}
          post={lightboxPost}
          comments={commentsForActivePost}
          commentsLoading={commentsLoadingActive}
          commentDraft={commentDraft}
          onCommentDraftChange={setCommentDraft}
          onSubmitComment={() => handleSubmitComment(lightboxPost.id)}
          commentSubmitting={
            commentMutation.isPending &&
            commentMutation.variables?.postId === lightboxPost.id
          }
          onToggleLike={() => handleToggleLike(lightboxPost.id)}
        />
      )}

      {isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={({ username }) => {
            const cleanNext = username?.trim().toLowerCase().replace(/^@/, "");
            const cleanRoute = routeUsername
              ?.trim()
              .toLowerCase()
              .replace(/^@/, "");
            if (!cleanNext) return;
            if (cleanRoute !== cleanNext) {
              navigate(`/profile/${cleanNext}`, { replace: true });
            }
          }}
        />
      )}

      <SocialListDialog
        open={followersOpen}
        onOpenChange={setFollowersOpen}
        title="followers"
        description={`Profiles that follow @${displayUsername}.`}
        items={followersQuery.data ?? []}
        pending={followersQuery.isPending}
        onNavigate={(item) => {
          setFollowersOpen(false);
          navigate(`/profile/${item.username ?? item.id}`);
        }}
      />

      <SocialListDialog
        open={followingOpen}
        onOpenChange={setFollowingOpen}
        title="following"
        description={`Profiles followed by @${displayUsername}.`}
        items={followingQuery.data ?? []}
        pending={followingQuery.isPending}
        onNavigate={(item) => {
          setFollowingOpen(false);
          navigate(`/profile/${item.username ?? item.id}`);
        }}
      />

      {isOwnProfile && (
        <TechDialog
          open={techOpen}
          onOpenChange={setTechOpen}
          topTech={topTech}
          onToggle={toggleTopTech}
        />
      )}

      <AuthDialog
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        defaultMode={authGateMode}
      />
    </div>
  );
};

/* ──────────── Posts list (wired to the same Explore card) ──────────── */

interface PostsListProps {
  isPending: boolean;
  isOwnProfile: boolean;
  userPosts: FeedPost[];
  openCommentsPostId: string | null;
  commentsFetchPostId: string | null;
  commentsForActivePost: PostComment[];
  commentsLoadingActive: boolean;
  commentDraft: string;
  commentMutationPending: boolean;
  commentMutationPostId?: string;
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onChangeCommentDraft: (v: string) => void;
  onSubmitComment: (postId: string) => void;
  onOpenMediaLightbox: (postId: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNext: () => void;
}

const PostsList = ({
  isPending,
  isOwnProfile,
  userPosts,
  openCommentsPostId,
  commentsFetchPostId,
  commentsForActivePost,
  commentsLoadingActive,
  commentDraft,
  commentMutationPending,
  commentMutationPostId,
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onOpenMediaLightbox,
  hasNextPage,
  isFetchingNextPage,
  onFetchNext,
}: PostsListProps) => {
  if (isPending) {
    return (
      <div className="rounded-[18px] border border-ink-line bg-ink-2 p-8 flex items-center justify-center gap-2 font-mono-jb text-[13px] text-muted-ink">
        <span className="w-4 h-4 rounded-full border-2 border-cream/20 border-t-orange animate-spin" />
        Loading posts…
      </div>
    );
  }

  if (!userPosts || userPosts.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-cream/15 bg-cream/[0.03] p-10 text-center">
        <Doodle.Sparkle
          size={28}
          className="text-orange mx-auto mb-3 opacity-70"
        />
        <p className="font-grot font-extrabold text-[16px] text-cream mb-1">
          No posts yet
        </p>
        <p className="font-mono-jb text-[12px] text-muted-ink">
          {isOwnProfile
            ? "Head to Explore to share your first update."
            : "This builder hasn't posted anything yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[18px] border border-ink-line bg-ink-2 overflow-hidden">
        {userPosts.map((post, i) => (
          <ExplorePostCard
            key={post.id}
            post={post}
            index={i}
            isCommentsOpen={openCommentsPostId === post.id}
            comments={
              openCommentsPostId === post.id &&
              commentsFetchPostId === post.id
                ? commentsForActivePost
                : []
            }
            commentsLoading={
              openCommentsPostId === post.id && commentsLoadingActive
            }
            commentDraft={commentDraft}
            commentSubmitting={
              commentMutationPending && commentMutationPostId === post.id
            }
            onToggleLike={() => onToggleLike(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
            onChangeCommentDraft={onChangeCommentDraft}
            onSubmitComment={() => onSubmitComment(post.id)}
            onOpenMediaLightbox={() => onOpenMediaLightbox(post.id)}
          />
        ))}
      </div>
      {hasNextPage && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={onFetchNext}
            className="rounded-full border border-dashed border-cream/25 text-cream font-mono-jb font-bold text-[12px] px-6 py-2.5 hover:border-cream/45 transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "loading…" : "load more posts ↓"}
          </button>
        </div>
      )}
    </>
  );
};

export default ProfilePageContent;
