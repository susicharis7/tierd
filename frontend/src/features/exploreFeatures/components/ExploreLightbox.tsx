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
      onToggleLike={onToggleLike}
    />
  );
}
