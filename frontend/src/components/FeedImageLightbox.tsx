import { Link } from "react-router-dom";
import { Heart, MessageSquare, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { cn, timeAgo } from "../lib/utils";
import type { FeedPost, PostComment } from "../features/exploreFeatures/exploreTypes";
import { MAX_POST_DISPLAY_CHARS } from "../features/exploreFeatures/exploreUiConstants";

function displayName(profile: FeedPost["author"]): string {
  return profile.full_name?.trim() || (profile.username ? `@${profile.username}` : "Anonymous Builder");
}

function handleStr(username: string | null): string {
  return username?.trim() ? `@${username}` : "@new_builder";
}

function authorInitial(author: FeedPost["author"]): string {
  const source = author.full_name || author.username || "U";
  return source.charAt(0).toUpperCase();
}

function formatPostDetailDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
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
  onToggleLike,
}: FeedImageLightboxProps) {
  const liked = !!post.liked_by_me;
  const imageUrl = post.image_url;
  if (!imageUrl) return null;

  const overCap = post.content.length > MAX_POST_DISPLAY_CHARS;
  const bodyDisplay = overCap
    ? post.content.slice(0, MAX_POST_DISPLAY_CHARS)
    : post.content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-black p-0 shadow-none duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "sm:flex-row",
        )}
        aria-describedby="feed-lightbox-desc"
      >
        <DialogTitle className="sr-only">
          Post by {displayName(post.author)}
        </DialogTitle>
        <DialogDescription id="feed-lightbox-desc" className="sr-only">
          {bodyDisplay.slice(0, 200)}
          {post.content.length > 200 ? "…" : ""}
        </DialogDescription>

        {/* Media column */}
        <div className="relative flex min-h-[38vh] flex-1 flex-col bg-black sm:min-h-0 sm:max-w-[72%]">
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-foreground backdrop-blur-md transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </DialogClose>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-3 z-10 hidden -translate-x-1/2 text-center sm:block">
            <p className="max-w-[min(90vw,24rem)] truncate text-xs text-white/70">
              <span className="font-medium text-white/90">{displayName(post.author)}</span>
              <span className="text-white/50"> · </span>
              <span>{handleStr(post.author.username)}</span>
            </p>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center p-2 pt-14 sm:p-4 sm:pt-4">
            <img
              src={imageUrl}
              alt={`${displayName(post.author)} post attachment`}
              className="max-h-[min(52vh,100%)] max-w-full object-contain sm:max-h-full"
            />
          </div>
        </div>

        {/* Detail column */}
        <div className="flex max-h-[min(62vh,100%)] w-full flex-col border-t border-border/40 bg-background sm:max-h-none sm:w-[min(100%,420px)] sm:shrink-0 sm:border-l sm:border-t-0">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="mb-4 flex items-start gap-3">
              <Link
                to={`/profile/${post.author.username ?? post.author.id}`}
                className="shrink-0"
              >
                <Avatar className="h-10 w-10 ring-1 ring-border/60">
                  {post.author.avatar_url && (
                    <AvatarImage src={post.author.avatar_url} alt={displayName(post.author)} />
                  )}
                  <AvatarFallback className="bg-ember/15 text-ember font-display font-bold text-sm">
                    {authorInitial(post.author)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${post.author.username ?? post.author.id}`}
                  className="block font-semibold text-foreground hover:text-ember"
                >
                  {displayName(post.author)}
                </Link>
                <p className="text-sm text-muted-foreground">{handleStr(post.author.username)}</p>
              </div>
            </div>

            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/95">
              {bodyDisplay}
            </p>
            {overCap && (
              <p className="mt-2 text-xs text-muted-foreground">
                This post is very long; only the first {MAX_POST_DISPLAY_CHARS.toLocaleString()}{" "}
                characters are shown here.
              </p>
            )}

            <p className="mt-3 text-xs text-muted-foreground">{formatPostDetailDate(post.created_at)}</p>

            <div className="mt-4 flex items-center gap-6 border-y border-border/55 py-3 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={onToggleLike}
                className={cn(
                  "flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted/40 hover:text-foreground",
                  liked && "text-ember",
                )}
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <Heart size={18} className={liked ? "fill-ember text-ember" : ""} />
                <span>{post.like_count}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageSquare size={18} />
                <span>{post.comment_count}</span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Replies
              </h3>
              {commentsLoading ? (
                <p className="text-xs text-muted-foreground">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments yet.</p>
              ) : (
                <ul className="space-y-4">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        {c.author.avatar_url && (
                          <AvatarImage
                            src={c.author.avatar_url}
                            alt={c.author.full_name ?? c.author.username ?? "User"}
                          />
                        )}
                        <AvatarFallback className="bg-ember/15 text-ember font-display font-bold text-[10px]">
                          {(c.author.full_name ?? c.author.username ?? "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                          <span className="text-sm font-medium text-foreground">
                            {c.author.full_name?.trim() ||
                              (c.author.username ? `@${c.author.username}` : "Anonymous")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(c.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{c.content}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <form
            className="shrink-0 border-t border-border/55 bg-background/95 p-4 backdrop-blur-sm"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitComment();
            }}
          >
            <Label htmlFor="feed-lightbox-comment" className="text-xs text-muted-foreground">
              Add a comment
            </Label>
            <Textarea
              id="feed-lightbox-comment"
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              placeholder="Write something thoughtful..."
              className="mt-8 bg-muted/30 border-border/60 focus-visible:ring-ember/50 min-h-[72px]"
            />
            <button
              type="submit"
              className="btn-primary mt-3 w-full text-xs py-2"
              disabled={!commentDraft.trim() || commentSubmitting}
            >
              {commentSubmitting ? "Posting" : "Post comment"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}


