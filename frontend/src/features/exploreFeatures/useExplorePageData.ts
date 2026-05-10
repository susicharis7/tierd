import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { ProfileRow } from "../authFeatures/authTypes";
import {
  addPostComment,
  createPost,
  fetchExploreFeedWithLikes,
  fetchPostComments,
  fetchProfileByUsername,
  fetchProfiles,
  fetchUserPostsWithLikes,
  searchProfiles,
  toggleLikePost,
} from "./explore";
import {
  isUserPostsQueryKey,
  patchCommentCountInInfinitePosts,
  patchLikeInInfinitePosts,
  type PostsInfiniteData,
} from "./exploreQueryCachePatches";
import { getExploreActionableMessage } from "./exploreErrors";
import { exploreKeys } from "./exploreQueryKeys";
import type {
  ExploreProfile,
  FeedPost,
  PaginatedResult,
  PostComment,
} from "./exploreTypes";
import { FEED_PAGE_SIZE } from "./exploreUiConstants";
import { toast } from "../../components/ui/sonner";
import { invalidateRankingQueries } from "../rankingFeatures/rankingCache";

export type ExploreFeedInfiniteData = InfiniteData<PaginatedResult<FeedPost>>;
export type UserPostsInfiniteData = PostsInfiniteData;

const FEED_STALE_MS = 30_000;
const SEARCH_DEBOUNCE_MS = 300;

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function useExploreProfilesQuery() {
  return useQuery({
    queryKey: exploreKeys.profiles(),
    queryFn: () => fetchProfiles(20),
    staleTime: FEED_STALE_MS,
  });
}

export function useExploreFeedQuery(userId: string | null) {
  return useInfiniteQuery({
    queryKey: exploreKeys.feed(userId),
    queryFn: ({ pageParam }) =>
      fetchExploreFeedWithLikes(
        userId,
        FEED_PAGE_SIZE,
        pageParam as string | undefined,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: FEED_STALE_MS,
  });
}

export function useExploreSearchQuery(searchInput: string) {
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const query = useQuery({
    queryKey: exploreKeys.search(debouncedSearch),
    queryFn: () => searchProfiles(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: FEED_STALE_MS,
  });
  return { ...query, debouncedSearch };
}

/**
 * Loads comments for the post that has focus: full-post lightbox takes precedence,
 * otherwise the inline comments panel post id.
 */
export function useExploreCommentsQuery(postIdForComments: string | null) {
  return useQuery({
    queryKey: postIdForComments
      ? exploreKeys.comments(postIdForComments)
      : (["explore", "comments", "closed"] as const),
    queryFn: () =>
      fetchPostComments({ postId: postIdForComments!, limit: 30 }),
    enabled: Boolean(postIdForComments),
    staleTime: FEED_STALE_MS,
  });
}

type LikeCtx = {
  previous: ExploreFeedInfiniteData | undefined;
  previousUserPosts: Array<{
    queryKey: readonly unknown[];
    data: UserPostsInfiniteData | undefined;
  }>;
};

export function useExploreLikeMutation(
  userId: string | null,
): UseMutationResult<void, Error, { postId: string }, LikeCtx | undefined> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      if (!userId) throw new Error("Not signed in");
      await toggleLikePost({ userId, postId });
    },
    onMutate: async ({ postId }) => {
      if (!userId) return undefined;
      await queryClient.cancelQueries({ queryKey: exploreKeys.feed(userId) });
      await queryClient.cancelQueries({
        predicate: (q) => isUserPostsQueryKey(q.queryKey),
      });

      const previous = queryClient.getQueryData<ExploreFeedInfiniteData>(
        exploreKeys.feed(userId),
      );
      const previousUserPosts = queryClient
        .getQueryCache()
        .findAll({ predicate: (q) => isUserPostsQueryKey(q.queryKey) })
        .map((q) => ({
          queryKey: q.queryKey as readonly unknown[],
          data: queryClient.getQueryData<UserPostsInfiniteData>(q.queryKey),
        }));

      queryClient.setQueryData<ExploreFeedInfiniteData>(
        exploreKeys.feed(userId),
        (old) => patchLikeInInfinitePosts(old, postId),
      );
      queryClient.setQueriesData<UserPostsInfiniteData>(
        { predicate: (q) => isUserPostsQueryKey(q.queryKey) },
        (old) => patchLikeInInfinitePosts(old, postId),
      );

      return { previous, previousUserPosts };
    },
    onError: (err, _vars, ctx) => {
      if (userId && ctx?.previous !== undefined) {
        queryClient.setQueryData(exploreKeys.feed(userId), ctx.previous);
      }
      if (ctx?.previousUserPosts) {
        for (const { queryKey, data } of ctx.previousUserPosts) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      const msg = err instanceof Error ? err.message : "Failed to update like.";
      toast(getExploreActionableMessage(err) ?? msg);
    },
    onSettled: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: exploreKeys.feed(userId) });
      }
      void queryClient.invalidateQueries({
        predicate: (q) => isUserPostsQueryKey(q.queryKey),
      });
      void invalidateRankingQueries(queryClient);
    },
  });
}

type CommentVars = { postId: string; content: string };
type CommentCtx = {
  prevComments: PostComment[] | undefined;
  prevFeed: ExploreFeedInfiniteData | undefined;
  prevUserPosts: Array<{
    queryKey: readonly unknown[];
    data: UserPostsInfiniteData | undefined;
  }>;
  tempId: string;
  postId: string;
};

export function useExploreAddCommentMutation(
  userId: string | null,
  profile: ProfileRow | null,
): UseMutationResult<
  PostComment,
  Error,
  CommentVars,
  CommentCtx | undefined
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: CommentVars) => {
      if (!userId) throw new Error("Not signed in");
      return addPostComment({ userId, postId, content });
    },
    onMutate: async ({ postId, content }) => {
      if (!userId) return undefined;
      const trimmed = content.trim();
      await queryClient.cancelQueries({ queryKey: exploreKeys.comments(postId) });
      await queryClient.cancelQueries({ queryKey: exploreKeys.feed(userId) });
      await queryClient.cancelQueries({
        predicate: (q) => isUserPostsQueryKey(q.queryKey),
      });

      const prevComments = queryClient.getQueryData<PostComment[]>(
        exploreKeys.comments(postId),
      );
      const prevFeed = queryClient.getQueryData<ExploreFeedInfiniteData>(
        exploreKeys.feed(userId),
      );
      const prevUserPosts = queryClient
        .getQueryCache()
        .findAll({ predicate: (q) => isUserPostsQueryKey(q.queryKey) })
        .map((q) => ({
          queryKey: q.queryKey as readonly unknown[],
          data: queryClient.getQueryData<UserPostsInfiniteData>(q.queryKey),
        }));

      const tempId = `optimistic-${crypto.randomUUID()}`;
      const optimistic: PostComment = {
        id: tempId,
        post_id: postId,
        content: trimmed,
        created_at: new Date().toISOString(),
        author: {
          id: userId,
          username: profile?.username ?? null,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
        },
      };

      queryClient.setQueryData<PostComment[]>(
        exploreKeys.comments(postId),
        (old) => [...(old ?? []), optimistic],
      );
      queryClient.setQueryData<ExploreFeedInfiniteData>(
        exploreKeys.feed(userId),
        (old) => patchCommentCountInInfinitePosts(old, postId, 1),
      );
      queryClient.setQueriesData<UserPostsInfiniteData>(
        { predicate: (q) => isUserPostsQueryKey(q.queryKey) },
        (old) => patchCommentCountInInfinitePosts(old, postId, 1),
      );

      return { prevComments, prevFeed, prevUserPosts, tempId, postId };
    },
    onSuccess: (data, variables, ctx) => {
      if (!ctx?.tempId) return;
      queryClient.setQueryData<PostComment[]>(
        exploreKeys.comments(variables.postId),
        (old) =>
          old?.map((c) => (c.id === ctx.tempId ? data : c)) ?? [data],
      );
    },
    onError: (err, variables, ctx) => {
      if (!ctx) return;
      if (ctx.prevComments !== undefined) {
        queryClient.setQueryData(
          exploreKeys.comments(variables.postId),
          ctx.prevComments,
        );
      }
      if (userId && ctx?.prevFeed !== undefined) {
        queryClient.setQueryData(exploreKeys.feed(userId), ctx.prevFeed);
      }
      if (ctx.prevUserPosts) {
        for (const { queryKey, data } of ctx.prevUserPosts) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      const msg =
        err instanceof Error ? err.message : "Failed to post comment.";
      toast(getExploreActionableMessage(err) ?? msg);
    },
    onSettled: (_data, _err, variables) => {
      void queryClient.invalidateQueries({
        queryKey: exploreKeys.comments(variables.postId),
      });
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: exploreKeys.feed(userId),
        });
      }
      void queryClient.invalidateQueries({
        predicate: (q) => isUserPostsQueryKey(q.queryKey),
      });
      void invalidateRankingQueries(queryClient);
    },
  });
}

export function useProfileByUsernameQuery(username: string | undefined) {
  return useQuery<ExploreProfile | null>({
    queryKey: exploreKeys.profileByUsername(username ?? ""),
    queryFn: () => fetchProfileByUsername(username!),
    enabled: Boolean(username),
    staleTime: FEED_STALE_MS,
  });
}

export function useUserPostsInfiniteQuery(
  viewerUserId: string | null,
  profileUserId: string | null,
) {
  return useInfiniteQuery({
    queryKey: exploreKeys.userPosts(profileUserId!, viewerUserId),
    queryFn: ({ pageParam }) =>
      fetchUserPostsWithLikes(
        viewerUserId,
        profileUserId!,
        FEED_PAGE_SIZE,
        pageParam as string | undefined,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(profileUserId),
    staleTime: FEED_STALE_MS,
  });
}

type CreatePostVars = { content: string; imageFile: File | null };

export function useExploreCreatePostMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, imageFile }: CreatePostVars) => {
      if (!userId) throw new Error("Not signed in");
      await createPost({
        userId,
        content,
        imageFile: imageFile || undefined,
      });
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: exploreKeys.feed(userId),
        });
        void queryClient.invalidateQueries({
          predicate: (q) =>
            isUserPostsQueryKey(q.queryKey) && q.queryKey[2] === userId,
        });
      }
      void invalidateRankingQueries(queryClient);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Failed to post.";
      toast(getExploreActionableMessage(err) ?? msg);
    },
  });
}


