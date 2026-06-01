import type { InfiniteData } from "@tanstack/react-query";
import type { FeedPost, PaginatedResult } from "./exploreTypes";

export type PostsInfiniteData = InfiniteData<PaginatedResult<FeedPost>>;

export function patchLikeInInfinitePosts(
  old: PostsInfiniteData | undefined,
  postId: string,
): PostsInfiniteData | undefined {
  if (!old) return old;
  let found = false;
  const pages = old.pages.map((page) => ({
    ...page,
    items: page.items.map((p) => {
      if (p.id !== postId) return p;
      found = true;
      const liked = !!p.liked_by_me;
      return {
        ...p,
        liked_by_me: !liked,
        like_count: Math.max(0, p.like_count + (liked ? -1 : 1)),
      };
    }),
  }));
  if (!found) return old;
  return { ...old, pages };
}

export function patchCommentCountInInfinitePosts(
  old: PostsInfiniteData | undefined,
  postId: string,
  delta: number,
): PostsInfiniteData | undefined {
  if (!old) return old;
  let found = false;
  const pages = old.pages.map((page) => ({
    ...page,
    items: page.items.map((p) => {
      if (p.id !== postId) return p;
      found = true;
      return {
        ...p,
        comment_count: Math.max(0, p.comment_count + delta),
      };
    }),
  }));
  if (!found) return old;
  return { ...old, pages };
}

export function patchRemovePostInInfinitePosts(
  old: PostsInfiniteData | undefined,
  postId: string,
): PostsInfiniteData | undefined {
  if (!old) return old;
  let found = false;
  const pages = old.pages.map((page) => {
    const nextItems = page.items.filter((p) => {
      if (p.id !== postId) return true;
      found = true;
      return false;
    });
    return { ...page, items: nextItems };
  });
  if (!found) return old;
  return { ...old, pages };
}

export function isUserPostsQueryKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key[0] === "explore" &&
    key[1] === "userPosts"
  );
}


