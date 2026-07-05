import type { ComponentProps, RefObject } from "react";
import { InlineSpinner } from "../../../components/ui/loading";
import { useDelayedPending } from "../../../hooks/useDelayedPending";
import { ExplorePostCard } from "../ExplorePostCard";
import { EmptyFeed, SkeletonCard } from "./ExploreFeedStates";

type ExplorePostCardProps = ComponentProps<typeof ExplorePostCard>;
type ExploreFeedPost = ExplorePostCardProps["post"];

type ExplorePostsSectionProps = {
  postsLoading: boolean;
  posts: ExploreFeedPost[];
  openCommentsPostId: string | null;
  commentsFetchPostId: string | null;
  commentsForActivePost: ExplorePostCardProps["comments"];
  commentsLoadingActive: boolean;
  commentDraft: string;
  commentMutationPending: boolean;
  commentMutationPostId?: string;
  currentUserId: string | null;
  deletingCommentId?: string;
  deletingPostId?: string;
  updatingPostId?: string;
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onChangeCommentDraft: (value: string) => void;
  onSubmitComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, content: string) => Promise<void>;
  onOpenMediaLightbox: (postId: string) => void;
  loadMoreSentinelRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
};

export function ExplorePostsSection({
  postsLoading,
  posts,
  openCommentsPostId,
  commentsFetchPostId,
  commentsForActivePost,
  commentsLoadingActive,
  commentDraft,
  commentMutationPending,
  commentMutationPostId,
  currentUserId,
  deletingCommentId,
  deletingPostId,
  updatingPostId,
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onDeleteComment,
  onDeletePost,
  onEditPost,
  onOpenMediaLightbox,
  loadMoreSentinelRef,
  isFetchingNextPage,
}: ExplorePostsSectionProps) {
  const showPostsSkeleton = useDelayedPending(postsLoading && posts.length === 0);

  return (
    <div
      className="rounded-[18px] border border-ink-line bg-ink-2 overflow-hidden"
      aria-busy={postsLoading || isFetchingNextPage}
    >
      {showPostsSkeleton ? (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </>
      ) : postsLoading && posts.length === 0 ? (
        <div className="min-h-[260px]" aria-hidden />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <>
          {posts.map((post, i) => (
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
              currentUserId={currentUserId}
              deletingCommentId={deletingCommentId}
              deletingPost={deletingPostId === post.id}
              updatingPost={updatingPostId === post.id}
              onToggleLike={() => onToggleLike(post.id)}
              onToggleComments={() => onToggleComments(post.id)}
              onChangeCommentDraft={onChangeCommentDraft}
              onSubmitComment={() => onSubmitComment(post.id)}
              onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
              onDeletePost={() => onDeletePost(post.id)}
              onEditPost={(content) => onEditPost(post.id, content)}
              onOpenMediaLightbox={() => onOpenMediaLightbox(post.id)}
            />
          ))}
          <div ref={loadMoreSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
          {isFetchingNextPage && (
            <div className="flex justify-center border-t border-dashed border-ink-line py-5">
              <InlineSpinner className="h-5 w-5" label="Loading more posts" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

