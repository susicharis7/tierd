import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Trash2, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Doodle, MonoCaption, Tape, UserAvatar } from "./tierd";
import { Textarea } from "./ui/textarea";
import {
  InlineSpinner,
  SkeletonCommentRow,
} from "./ui/loading";
import { cn, timeAgo } from "../lib/utils";
import type {
  FeedPost,
  PostComment,
} from "../features/exploreFeatures/exploreTypes";
import { MAX_POST_DISPLAY_CHARS } from "../features/exploreFeatures/exploreUiConstants";

function displayName(author: FeedPost["author"]): string {
  return (
    author.full_name?.trim() ||
    (author.username ? `@${author.username}` : "Anonymous Builder")
  );
}

function handleStr(username: string | null): string {
  return username?.trim() ? `@${username}` : "@new_builder";
}

function formatPostDetailDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export interface FeedImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: FeedPost;
  comments: PostComment[];
  commentsLoading: boolean;
  commentDraft: string;
  onCommentDraftChange: (v: string) => void;
  onSubmitComment: () => void;
  commentSubmitting: boolean;
  currentUserId: string | null;
  deletingCommentId?: string;
  deletingPost?: boolean;
  onDeleteComment: (commentId: string) => void;
  onDeletePost: () => void;
  onToggleLike: () => void;
}

export default function FeedImageLightbox({
  open,
  onOpenChange,
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
}: FeedImageLightboxProps) {
  const liked = !!post.liked_by_me;
  const imageUrl = post.image_url;
  if (!imageUrl) return null;

  const overCap = post.content.length > MAX_POST_DISPLAY_CHARS;
  const bodyDisplay = overCap
    ? post.content.slice(0, MAX_POST_DISPLAY_CHARS)
    : post.content;
  const authorName = displayName(post.author);
  const profilePath = `/profile/${post.author.username ?? post.author.id}`;
  const canDeletePost = Boolean(currentUserId && post.author.id === currentUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-ink p-0 shadow-none",
          // Smoother entry/exit: overlay fade + content zoom + slight slide-up
          "duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-[0.98] data-[state=closed]:zoom-out-[0.98]",
          "data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2",
          "sm:flex-row",
        )}
        aria-describedby="feed-lightbox-desc"
      >
        <DialogTitle className="sr-only">Post by {authorName}</DialogTitle>
        <DialogDescription id="feed-lightbox-desc" className="sr-only">
          {bodyDisplay.slice(0, 200)}
          {post.content.length > 200 ? "…" : ""}
        </DialogDescription>

        {/* Media column */}
        <div className="relative flex min-h-[40vh] flex-1 flex-col bg-black sm:min-h-0 sm:max-w-[68%]">
          {/* Close button */}
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-cream backdrop-blur-md transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </div>

          {/* Floating author chip top-center */}
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 hidden -translate-x-1/2 text-center sm:block">
            <p className="max-w-[min(90vw,28rem)] truncate inline-flex items-center gap-2 rounded-full bg-ink/60 backdrop-blur-md px-3 py-1.5 border border-cream/10">
              <span className="font-grot font-bold text-[13px] text-cream">
                {authorName}
              </span>
              <span className="font-mono-jb text-[11px] text-cream/55">
                {handleStr(post.author.username)}
              </span>
            </p>
          </div>

          {/* Decorative corner brackets — match the post-card chrome */}
          <Doodle.CornerBracket
            size={22}
            corner="tl"
            className="absolute top-3 left-3 text-orange/30 pointer-events-none hidden sm:block z-[5]"
            aria-hidden
          />
          <Doodle.CornerBracket
            size={22}
            corner="br"
            className="absolute bottom-3 right-3 text-orange/30 pointer-events-none hidden sm:block z-[5]"
            aria-hidden
          />

          <div className="flex min-h-0 flex-1 items-center justify-center p-3 pt-16 sm:p-6 sm:pt-6">
            <img
              src={imageUrl}
              alt={`${authorName} post attachment`}
              className={cn(
                "max-h-[min(56vh,100%)] max-w-full object-contain sm:max-h-full rounded-lg shadow-[0_24px_48px_rgba(0,0,0,0.5)]",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 duration-500",
              )}
            />
          </div>
        </div>

        {/* Detail column */}
        <aside
          className={cn(
            "relative flex max-h-[min(62vh,100%)] w-full flex-col border-t border-cream/10 bg-ink-2 sm:max-h-none sm:w-[min(100%,440px)] sm:shrink-0 sm:border-l sm:border-t-0",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-4 duration-300",
          )}
        >
          <Tape
            color="tape"
            size="md"
            tilt={-4}
            className="-top-[10px] left-12 hidden sm:block z-10"
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {/* Author */}
            <div className="mb-4 flex items-start gap-3">
              <Link to={profilePath} className="shrink-0">
                <UserAvatar
                  name={authorName}
                  src={post.author.avatar_url}
                  size={44}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={profilePath}
                  className="block font-grot font-extrabold text-[16px] text-cream hover:text-orange transition-colors"
                >
                  {authorName}
                </Link>
                <p className="font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-ink mt-0.5">
                  {handleStr(post.author.username)}
                </p>
              </div>
              {canDeletePost && (
                <button
                  type="button"
                  onClick={onDeletePost}
                  disabled={deletingPost}
                  className="inline-flex items-center gap-1 rounded-full border border-cream/20 px-2 py-1 text-[10px] font-mono-jb text-cream/75 hover:border-orange hover:text-orange disabled:opacity-50"
                  aria-label="Delete post"
                >
                  <Trash2 size={10} />
                  {deletingPost ? "..." : "delete post"}
                </button>
              )}
            </div>

            {/* Body */}
            <p className="font-grot text-[15px] leading-[1.55] text-cream/90 whitespace-pre-line">
              {bodyDisplay}
            </p>
            {overCap && (
              <p className="mt-2 font-mono-jb text-[11px] text-muted-ink leading-[1.5]">
                This post is very long; only the first{" "}
                {MAX_POST_DISPLAY_CHARS.toLocaleString()} characters are shown
                here.
              </p>
            )}

            <p className="mt-3 font-mono-jb text-[11px] uppercase tracking-[0.08em] text-muted-ink">
              {formatPostDetailDate(post.created_at)}
            </p>

            {/* Reactions */}
            <div className="mt-4 flex items-center gap-1 -ml-2 py-3 border-y border-dashed border-cream/10">
              <button
                type="button"
                onClick={onToggleLike}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-mono-jb text-[12px] transition-colors hover:bg-orange/10",
                  liked ? "text-orange" : "text-cream/55 hover:text-cream/85",
                )}
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <Heart
                  size={16}
                  className={liked ? "fill-orange text-orange" : ""}
                />
                <span className="font-bold tabular-nums">
                  {post.like_count}
                </span>
              </button>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-mono-jb text-[12px] text-cream/55">
                <MessageSquare size={16} />
                <span className="font-bold tabular-nums">
                  {post.comment_count}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-5 space-y-4">
              <MonoCaption tone="cream">// replies</MonoCaption>
              {commentsLoading ? (
                <div className="space-y-4" aria-hidden="true">
                  <SkeletonCommentRow />
                  <SkeletonCommentRow />
                  <SkeletonCommentRow />
                </div>
              ) : comments.length === 0 ? (
                <p className="font-mono-jb text-[12px] text-muted-ink">
                  No comments yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <CommentRow
                      key={c.id}
                      comment={c}
                      canDelete={Boolean(currentUserId && c.author.id === currentUserId)}
                      deleting={deletingCommentId === c.id}
                      onDelete={() => onDeleteComment(c.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Composer */}
          <form
            className="shrink-0 border-t border-dashed border-cream/10 bg-ink/95 px-5 py-4 backdrop-blur-sm"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitComment();
            }}
          >
            <Textarea
              id="feed-lightbox-comment"
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              placeholder="write something thoughtful…"
              className="bg-cream/[0.04] border-cream/10 focus-visible:ring-orange/50 min-h-[64px] text-[13px] font-mono-jb resize-none text-cream placeholder:text-muted-ink"
            />
            <button
              type="submit"
              disabled={!commentDraft.trim() || commentSubmitting}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-orange text-cream font-mono-jb font-bold text-[13px] px-5 py-2.5 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {commentSubmitting ? (
                <>
                  <InlineSpinner className="h-3.5 w-3.5" label="Posting comment" />
                  posting...
                </>
              ) : (
                "post comment"
              )}
            </button>
          </form>
        </aside>
      </DialogContent>
    </Dialog>
  );
}

function CommentRow({
  comment: c,
  canDelete,
  deleting,
  onDelete,
}: {
  comment: PostComment;
  canDelete: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const name = c.author.full_name?.trim() || c.author.username || "Anonymous";
  const isLongComment = c.content.split(/\r\n|\r|\n/).length > 15 || c.content.length > 1200;

  return (
    <li className="flex gap-3">
      <UserAvatar
        name={name}
        src={c.author.avatar_url}
        size={32}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="font-grot text-[13px] font-bold text-cream">
            {c.author.full_name?.trim() ||
              (c.author.username ? `@${c.author.username}` : "Anonymous")}
          </span>
          <span className="font-mono-jb text-[10px] text-muted-ink">
            {timeAgo(c.created_at)}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-cream/20 px-2 py-1 text-[10px] font-mono-jb text-cream/75 hover:border-orange hover:text-orange disabled:opacity-50"
              aria-label="Delete comment"
            >
              <Trash2 size={10} />
              {deleting ? "..." : "delete"}
            </button>
          )}
        </div>
        <p
          className={cn(
            "mt-1 whitespace-pre-line font-grot text-[14px] text-cream/85 leading-[1.5]",
            isLongComment && !expanded && "max-h-[315px] overflow-hidden",
          )}
        >
          {c.content}
        </p>
        {isLongComment && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-2 font-mono-jb text-[10px] uppercase tracking-[0.1em] text-orange hover:text-orange-2"
          >
            {expanded ? "show less" : "show more"}
          </button>
        )}
      </div>
    </li>
  );
}
