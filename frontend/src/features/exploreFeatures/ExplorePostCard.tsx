import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";

import { Doodle, UserAvatar } from "../../components/tierd";
import { Textarea } from "../../components/ui/textarea";
import {
  InlineSpinner,
  SkeletonCommentRow,
} from "../../components/ui/loading";
import { cn, timeAgo } from "../../lib/utils";
import {
  authorDisplayName,
  authorHandleStr,
} from "./exploreAuthorDisplay";
import type { FeedPost, PostComment } from "./exploreTypes";
import { FEED_POST_PREVIEW_CHARS } from "./exploreUiConstants";

const TEXT_COLLAPSE_LINE_LIMIT = 15;
const POST_COLLAPSE_MAX_HEIGHT = 16 * 1.45 * TEXT_COLLAPSE_LINE_LIMIT;
const COMMENT_COLLAPSE_MAX_HEIGHT = 14 * 1.5 * TEXT_COLLAPSE_LINE_LIMIT;

function shouldCollapseText(text: string) {
  return text.split(/\r\n|\r|\n/).length > TEXT_COLLAPSE_LINE_LIMIT || text.length > FEED_POST_PREVIEW_CHARS;
}

export function ExplorePostCard({
  post,
  index,
  isCommentsOpen,
  comments,
  commentsLoading,
  commentDraft,
  commentSubmitting,
  currentUserId,
  deletingCommentId,
  deletingPost,
  updatingPost,
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onDeleteComment,
  onDeletePost,
  onEditPost,
  onOpenMediaLightbox,
}: {
  post: FeedPost;
  index: number;
  isCommentsOpen: boolean;
  comments: PostComment[];
  commentsLoading: boolean;
  commentDraft: string;
  commentSubmitting: boolean;
  currentUserId: string | null;
  deletingCommentId?: string;
  deletingPost?: boolean;
  updatingPost?: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onChangeCommentDraft: (v: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onDeletePost: () => void;
  onEditPost: (content: string) => Promise<void>;
  onOpenMediaLightbox: () => void;
}) {
  const liked = !!post.liked_by_me;
  const [feedBodyExpanded, setFeedBodyExpanded] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editDraft, setEditDraft] = useState(post.content);
  const feedTextLong = shouldCollapseText(post.content);

  const authorName = authorDisplayName(post.author);
  const profilePath = `/profile/${post.author.username ?? post.author.id}`;
  const canDeletePost = Boolean(currentUserId && post.author.id === currentUserId);
  const canEditPost = canDeletePost;
  const editUnchanged = editDraft.trim() === post.content.trim();

  useEffect(() => {
    if (!isEditingPost) {
      setEditDraft(post.content);
    }
  }, [post.content, isEditingPost]);

  const handleSaveEdit = async () => {
    await onEditPost(editDraft);
    setIsEditingPost(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.35 }}
      className="group relative"
    >
      <div className="relative px-6 py-6 transition-colors hover:bg-cream/[0.02]">
        {/* Decorative corner brackets */}
        <Doodle.CornerBracket
          size={18}
          corner="tl"
          className="absolute top-3 left-3 text-orange/60 pointer-events-none hidden sm:block"
          aria-hidden
        />
        <Doodle.CornerBracket
          size={18}
          corner="tr"
          className="absolute top-3 right-3 text-orange/60 pointer-events-none hidden sm:block"
          aria-hidden
        />

        <div className="flex gap-3.5">
          <div className="shrink-0 pt-0.5">
            <Link
              to={profilePath}
              className="block outline-none rounded-full focus-visible:ring-2 focus-visible:ring-orange"
            >
              <UserAvatar
                name={authorName}
                src={post.author.avatar_url}
                size={42}
              />
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link
                to={profilePath}
                className="inline-flex items-center gap-2 min-w-0"
              >
                <span className="font-grot text-[16px] font-extrabold text-cream truncate transition-colors group-hover:text-orange">
                  {authorName}
                </span>
                <span className="font-mono-jb text-[11px] text-muted-ink truncate">
                  {authorHandleStr(post.author.username)}
                </span>
              </Link>
              <span className="font-mono-jb text-[11px] text-muted-ink">·</span>
              <span className="font-mono-jb text-[11px] text-muted-ink shrink-0">
                {timeAgo(post.created_at)}
              </span>
              {canDeletePost && (
                <div className="ml-auto flex items-center gap-1.5">
                  {canEditPost && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditDraft(post.content);
                        setIsEditingPost(true);
                      }}
                      disabled={deletingPost || updatingPost}
                      className="inline-flex items-center gap-1 rounded-full border border-cream/20 px-2 py-1 text-[10px] font-mono-jb text-cream/75 hover:border-orange hover:text-orange disabled:opacity-50"
                      aria-label="Edit post"
                    >
                      <Pencil size={10} />
                      edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onDeletePost}
                    disabled={deletingPost || updatingPost}
                    className="inline-flex items-center gap-1 rounded-full border border-cream/20 px-2 py-1 text-[10px] font-mono-jb text-cream/75 hover:border-orange hover:text-orange disabled:opacity-50"
                    aria-label="Delete post"
                  >
                    <Trash2 size={10} />
                    {deletingPost ? "..." : "delete post"}
                  </button>
                </div>
              )}
            </div>

            <div className="mb-3">
              {isEditingPost ? (
                <div className="space-y-2">
                  <Textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="bg-cream/[0.04] border-ink-line focus-visible:ring-orange/40 min-h-[96px] text-[14px] font-grot resize-none text-cream placeholder:text-muted-ink"
                    rows={4}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPost(false);
                        setEditDraft(post.content);
                      }}
                      disabled={updatingPost}
                      className="rounded-full border border-cream/25 px-3 py-1.5 text-[11px] font-mono-jb text-cream/80 hover:border-cream/45 disabled:opacity-50"
                    >
                      cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveEdit()}
                      disabled={updatingPost || !editDraft.trim() || editUnchanged}
                      className="rounded-full bg-orange px-3 py-1.5 text-[11px] font-mono-jb font-bold text-cream disabled:opacity-50"
                    >
                      {updatingPost ? "saving..." : "save edit"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p
                    className={cn(
                      "font-grot text-[16px] leading-[1.45] text-cream/90 whitespace-pre-line",
                      feedTextLong && !feedBodyExpanded && "overflow-hidden",
                    )}
                    style={
                      feedTextLong && !feedBodyExpanded
                        ? { maxHeight: POST_COLLAPSE_MAX_HEIGHT }
                        : undefined
                    }
                  >
                    {post.content}
                  </p>
                  {feedTextLong && (
                    <button
                      type="button"
                      className="mt-1 font-mono-jb text-[12px] font-bold text-orange/80 hover:text-orange transition-colors"
                      onClick={() => setFeedBodyExpanded((e) => !e)}
                    >
                      {feedBodyExpanded ? "show less" : "show more"}
                    </button>
                  )}
                </>
              )}
            </div>

            {post.image_url && (
              <button
                type="button"
                onClick={onOpenMediaLightbox}
                className="relative block w-full overflow-hidden rounded-2xl border border-ink-line bg-black/30 text-left transition-all hover:border-cream/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange mb-2"
                aria-label="View full image"
              >
                <div className="relative w-full max-h-[28rem] overflow-hidden">
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="w-full max-h-[28rem] object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5"
                    aria-hidden
                  />
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <ImageIcon size={12} className="text-cream/80" />
                    <span className="font-mono-jb text-[11px] font-medium text-cream/80">
                      view
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 -ml-2 mt-2 pt-3 border-t border-dashed border-ink-line">
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
                  size={14}
                  className={liked ? "fill-orange text-orange" : ""}
                />
                <span className="font-bold tabular-nums">{post.like_count}</span>
              </button>
              <button
                type="button"
                onClick={onToggleComments}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-mono-jb text-[12px] text-cream/55 hover:bg-cream/[0.04] hover:text-cream/85 transition-colors"
                aria-label="Open comments"
              >
                <MessageSquare size={14} />
                <span className="font-bold tabular-nums">
                  {post.comment_count}
                </span>
              </button>
            </div>

            {isCommentsOpen && (
              <div className="mt-3 pt-3 border-t border-dashed border-ink-line space-y-0">
                <div className="space-y-3.5">
                  {commentsLoading ? (
                    <div className="space-y-3.5 py-2" aria-hidden="true">
                      <SkeletonCommentRow />
                      <SkeletonCommentRow />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="font-mono-jb text-[12px] text-muted-ink py-2">
                      No comments yet. Be the first to share feedback.
                    </p>
                  ) : (
                    comments.map((c) => (
                      <CommentRow
                        key={c.id}
                        comment={c}
                        canDelete={Boolean(currentUserId && c.author.id === currentUserId)}
                        deleting={deletingCommentId === c.id}
                        onDelete={() => onDeleteComment(c.id)}
                      />
                    ))
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSubmitComment();
                  }}
                  className="mt-6 pt-4 border-t border-dashed border-ink-line flex gap-2"
                >
                  <Textarea
                    id={`comment-${post.id}`}
                    value={commentDraft}
                    onChange={(e) => onChangeCommentDraft(e.target.value)}
                    placeholder="write something thoughtful…"
                    className="bg-cream/[0.04] border-ink-line focus-visible:ring-orange/40 min-h-[38px] max-h-[120px] text-[13px] font-mono-jb resize-none flex-1 text-cream placeholder:text-muted-ink"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!commentDraft.trim() || commentSubmitting}
                    className="self-end shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange text-cream font-mono-jb font-bold text-[12px] px-4 py-2 shadow-cta-orange hover:translate-y-px transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {commentSubmitting ? (
                      <InlineSpinner className="h-3.5 w-3.5" label="Posting comment" />
                    ) : (
                      "post"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-cream/[0.06]" />
    </motion.article>
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
  const commentLong = shouldCollapseText(c.content);

  return (
    <div className="flex items-start gap-2.5">
      <UserAvatar
        name={name}
        src={c.author.avatar_url}
        size={28}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="font-grot text-[13px] font-bold text-cream truncate">
            {c.author.full_name?.trim() ||
              (c.author.username ? `@${c.author.username}` : "Anonymous")}
          </p>
          <p className="font-mono-jb text-[10px] text-muted-ink">
            {timeAgo(c.created_at)}
          </p>
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
            "mt-1 font-grot text-[14px] leading-[1.5] text-cream/80 whitespace-pre-line",
            commentLong && !expanded && "overflow-hidden",
          )}
          style={
            commentLong && !expanded
              ? { maxHeight: COMMENT_COLLAPSE_MAX_HEIGHT }
              : undefined
          }
        >
          {c.content}
        </p>
        {commentLong && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 font-mono-jb text-[10px] uppercase tracking-[0.1em] text-orange hover:text-orange-2"
          >
            {expanded ? "show less" : "show more"}
          </button>
        )}
      </div>
    </div>
  );
}
