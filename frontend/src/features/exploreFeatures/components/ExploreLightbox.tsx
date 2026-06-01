import type { ComponentProps } from "react";
import FeedImageLightbox from "../../../components/FeedImageLightbox";

type FeedImageLightboxProps = ComponentProps<typeof FeedImageLightbox>;

type ExploreLightboxProps = {
  post: FeedImageLightboxProps["post"];
  comments: FeedImageLightboxProps["comments"];
  commentsLoading: FeedImageLightboxProps["commentsLoading"];
  commentDraft: FeedImageLightboxProps["commentDraft"];
  onCommentDraftChange: FeedImageLightboxProps["onCommentDraftChange"];
  onSubmitComment: FeedImageLightboxProps["onSubmitComment"];
  commentSubmitting: FeedImageLightboxProps["commentSubmitting"];
  currentUserId: FeedImageLightboxProps["currentUserId"];
  deletingCommentId: FeedImageLightboxProps["deletingCommentId"];
  deletingPost: FeedImageLightboxProps["deletingPost"];
  onDeleteComment: FeedImageLightboxProps["onDeleteComment"];
  onDeletePost: FeedImageLightboxProps["onDeletePost"];
  onToggleLike: FeedImageLightboxProps["onToggleLike"];
  onClose: () => void;
};

export function ExploreLightbox({
  post,
  comments,
  commentsLoading,
  commentDraft,
  onCommentDraftChange,
  onSubmitComment,
  commentSubmitting,
  currentUserId,
  deletingCommentId,
  deletingPost,
  onDeleteComment,
  onDeletePost,
  onToggleLike,
  onClose,
}: ExploreLightboxProps) {
  return (
    <FeedImageLightbox
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      post={post}
      comments={comments}
      commentsLoading={commentsLoading}
      commentDraft={commentDraft}
      onCommentDraftChange={onCommentDraftChange}
      onSubmitComment={onSubmitComment}
      commentSubmitting={commentSubmitting}
      currentUserId={currentUserId}
      deletingCommentId={deletingCommentId}
      deletingPost={deletingPost}
      onDeleteComment={onDeleteComment}
      onDeletePost={onDeletePost}
      onToggleLike={onToggleLike}
    />
  );
}
