import type { ComponentProps, RefObject } from "react";
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
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onChangeCommentDraft: (value: string) => void;
  onSubmitComment: (postId: string) => void;
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
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onOpenMediaLightbox,
  loadMoreSentinelRef,
  isFetchingNextPage,
}: ExplorePostsSectionProps) {
  return (
    <div className="rounded-2xl border border-border/20 bg-muted/3 overflow-hidden">
      {postsLoading ? (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </>
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
              onToggleLike={() => onToggleLike(post.id)}
              onToggleComments={() => onToggleComments(post.id)}
              onChangeCommentDraft={onChangeCommentDraft}
              onSubmitComment={() => onSubmitComment(post.id)}
              onOpenMediaLightbox={() => onOpenMediaLightbox(post.id)}
            />
          ))}
          <div ref={loadMoreSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
          {isFetchingNextPage && (
            <div className="flex justify-center border-t border-border/15 py-5">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-ember/30 border-t-ember"
                role="status"
                aria-label="Loading more posts"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}


