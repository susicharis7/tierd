import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import { timeAgo } from "../../lib/utils";
import {
  authorDisplayName,
  authorHandleStr,
  authorInitial,
} from "./exploreAuthorDisplay";
import type { FeedPost, PostComment } from "./exploreTypes";
import { FEED_POST_PREVIEW_CHARS } from "./exploreUiConstants";

export function ExplorePostCard({
  post,
  index,
  isCommentsOpen,
  comments,
  commentsLoading,
  commentDraft,
  commentSubmitting,
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onOpenMediaLightbox,
}: {
  post: FeedPost;
  index: number;
  isCommentsOpen: boolean;
  comments: PostComment[];
  commentsLoading: boolean;
  commentDraft: string;
  commentSubmitting: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onChangeCommentDraft: (v: string) => void;
  onSubmitComment: () => void;
  onOpenMediaLightbox: () => void;
}) {
  const liked = !!post.liked_by_me;
  const [feedBodyExpanded, setFeedBodyExpanded] = useState(false);
  const feedTextLong = post.content.length > FEED_POST_PREVIEW_CHARS;
  const feedBodyText =
    feedTextLong && !feedBodyExpanded
      ? post.content.slice(0, FEED_POST_PREVIEW_CHARS).trimEnd()
      : post.content;

  const profilePath = `/profile/${post.author.username ?? post.author.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.35 }}
      className="group relative"
    >
      <div className="absolute left-0 top-4 bottom-4 w-px rounded-full bg-ember/0 group-hover:bg-ember/20 transition-all duration-300" />

      <div className="flex gap-3.5 px-5 py-5 transition-colors hover:bg-muted/[0.04] sm:px-5">
        <div className="shrink-0 pt-0.5">
          <Link
            to={profilePath}
            className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <Avatar className="h-11 w-11 ring-1 ring-border/40 transition-all group-hover:ring-ember/30">
              {post.author.avatar_url && (
                <AvatarImage
                  src={post.author.avatar_url}
                  alt={authorDisplayName(post.author)}
                />
              )}
              <AvatarFallback className="bg-ember/10 text-ember font-display font-bold text-sm">
                {authorInitial(post.author)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to={profilePath}
              className="inline-flex items-center gap-2 min-w-0 outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-display text-[15px] font-bold text-foreground truncate transition-colors group-hover:text-ember">
                {authorDisplayName(post.author)}
              </span>
              <span className="text-sm text-muted-foreground/55 truncate">
                {authorHandleStr(post.author.username)}
              </span>
            </Link>
            <span className="text-sm text-muted-foreground/35">·</span>
            <span className="text-sm text-muted-foreground/45 shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-[0.9375rem] leading-relaxed text-foreground/88 whitespace-pre-line">
              {feedBodyText}
              {feedTextLong && !feedBodyExpanded ? "…" : null}
            </p>
            {feedTextLong && (
              <button
                type="button"
                className="mt-1 text-sm font-medium text-ember/70 hover:text-ember transition-colors"
                onClick={() => setFeedBodyExpanded((e) => !e)}
              >
                {feedBodyExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {post.image_url && (
            <button
              type="button"
              onClick={onOpenMediaLightbox}
              className="relative block w-full overflow-hidden rounded-2xl border border-border/30 bg-black/30 text-left transition-all hover:border-border/50 hover:shadow-[0_8px_32px_-12px_hsl(var(--ember)/0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-1"
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
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ImageIcon size={12} className="text-white/80" />
                  <span className="text-xs font-medium text-white/75">
                    View
                  </span>
                </div>
              </div>
            </button>
          )}

          <div className="flex items-center gap-1 -ml-2.5 mt-1">
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all hover:bg-ember/8 ${
                liked
                  ? "text-ember"
                  : "text-muted-foreground/50 hover:text-foreground/70"
              }`}
              aria-label={liked ? "Unlike post" : "Like post"}
            >
              <Heart
                size={16}
                className={liked ? "fill-ember text-ember" : ""}
              />
              <span className="font-semibold tabular-nums">
                {post.like_count}
              </span>
            </button>
            <button
              type="button"
              onClick={onToggleComments}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground/50 transition-all hover:bg-muted/15 hover:text-foreground/70"
              aria-label="Open comments"
            >
              <MessageSquare size={16} />
              <span className="font-semibold tabular-nums">
                {post.comment_count}
              </span>
            </button>
          </div>

          {isCommentsOpen && (
            <div className="mt-3 pt-3 border-t border-border/20 space-y-0">
              <div className="space-y-3">
                {commentsLoading ? (
                  <div className="text-xs text-muted-foreground/50 py-2">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-xs text-muted-foreground/50 py-2">
                    No comments yet. Be the first to share feedback.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                        {c.author.avatar_url && (
                          <AvatarImage
                            src={c.author.avatar_url}
                            alt={
                              c.author.full_name ?? c.author.username ?? "User"
                            }
                          />
                        )}
                        <AvatarFallback className="bg-ember/8 text-ember font-display text-xs font-bold">
                          {(c.author.full_name ?? c.author.username ?? "U")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-xs font-bold text-foreground">
                            {c.author.full_name?.trim() ||
                              (c.author.username
                                ? `@${c.author.username}`
                                : "Anonymous")}
                          </p>
                          <p className="text-xs text-muted-foreground/45">
                            {timeAgo(c.created_at)}
                          </p>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground/75 whitespace-pre-line">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitComment();
                }}
                className="mt-14 pt-4 border-t border-border/20 flex gap-2"
              >
                <Textarea
                  id={`comment-${post.id}`}
                  value={commentDraft}
                  onChange={(e) => onChangeCommentDraft(e.target.value)}
                  placeholder="Write something thoughtful..."
                  className="bg-muted/10 border-border/30 focus-visible:ring-ember/40 min-h-[38px] max-h-[120px] text-sm resize-none flex-1"
                  rows={1}
                />
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-2 self-end shrink-0"
                  disabled={!commentDraft.trim() || commentSubmitting}
                >
                  {commentSubmitting ? "..." : "Post"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-border/15" />
    </motion.article>
  );
}


