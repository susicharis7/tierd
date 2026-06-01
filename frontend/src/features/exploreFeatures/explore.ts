import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { storageRepository } from "../../repositories/storageRepository";
import { postService } from "../../services/postService";
import type { ExploreProfile, FeedPost, PaginatedResult, PostComment } from "./exploreTypes";
import { logExploreDevError, warnExploreProfilesMissingForAuthors } from "./exploreErrors";

export async function fetchProfiles(limit = 20): Promise<ExploreProfile[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified, email_2fa_enabled, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Explore] fetchProfiles error", error);
    logExploreDevError("fetchProfiles", error);
    return [];
  }
  return data ?? [];
}

export async function searchProfiles(query: string, limit = 20): Promise<ExploreProfile[]> {
  if (!isSupabaseConfigured || !query.trim()) return [];

  const term = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified, email_2fa_enabled, created_at")
    .or(`full_name.ilike.${term},username.ilike.${term}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Explore] searchProfiles error", error);
    logExploreDevError("searchProfiles", error);
    return [];
  }
  return data ?? [];
}

export async function fetchFeedPosts(params: {
  limit: number;
  /** ISO timestamp; fetch posts strictly older than this (exclusive). */
  cursor?: string;
}): Promise<PaginatedResult<FeedPost>> {
  const { limit, cursor } = params;
  if (!isSupabaseConfigured) {
    return { items: [], nextCursor: null };
  }

  let query = supabase
    .from("posts_with_counts")
    .select(`
      id,
      content,
      image_url,
      created_at,
      like_count,
      comment_count,
      user_id
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Explore] fetchFeedPosts error", error);
    logExploreDevError("fetchFeedPosts (posts_with_counts)", error);
    return { items: [], nextCursor: null };
  }

  if (!data || data.length === 0) {
    return { items: [], nextCursor: null };
  }

  const userIds = [...new Set(data.map((p) => p.user_id as string))];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  if (profileError) {
    console.error("[Explore] fetchFeedPosts profiles error", profileError);
    logExploreDevError("fetchFeedPosts (profiles join)", profileError);
  }

  warnExploreProfilesMissingForAuthors(
    data.length,
    userIds.length,
    (profiles ?? []).length,
  );

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  const items: FeedPost[] = data.map((row) => {
    const author = profileMap.get(row.user_id as string);
    return {
      id: row.id as string,
      content: row.content as string,
      image_url: row.image_url as string | null,
      created_at: row.created_at as string,
      like_count: (row.like_count as number) ?? 0,
      comment_count: (row.comment_count as number) ?? 0,
      author: {
        id: (row.user_id as string) ?? "",
        username: author?.username ?? null,
        full_name: author?.full_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
    };
  });

  const nextCursor =
    items.length === limit ? items[items.length - 1].created_at : null;

  return { items, nextCursor };
}

/** Feed posts with `liked_by_me` set when `userId` is provided (for TanStack Query cache). */
export async function fetchExploreFeedWithLikes(
  userId: string | null,
  pageSize: number,
  cursor?: string,
): Promise<PaginatedResult<FeedPost>> {
  const { items, nextCursor } = await fetchFeedPosts({
    limit: pageSize,
    cursor,
  });
  if (items.length === 0) {
    return { items: [], nextCursor: null };
  }

  if (!userId) {
    return {
      items: items.map((p) => ({ ...p, liked_by_me: false })),
      nextCursor,
    };
  }

  const likedSet = await fetchUserLikedPostIds({
    userId,
    postIds: items.map((p) => p.id),
  });

  return {
    items: items.map((p) => ({
      ...p,
      liked_by_me: likedSet.has(p.id),
    })),
    nextCursor,
  };
}

/** Fetch posts by a single user (for profile pages). */
export async function fetchUserPosts(params: {
  userId: string;
  limit: number;
  cursor?: string;
}): Promise<PaginatedResult<FeedPost>> {
  const { userId, limit, cursor } = params;
  if (!isSupabaseConfigured) {
    return { items: [], nextCursor: null };
  }

  let query = supabase
    .from("posts_with_counts")
    .select("id, content, image_url, created_at, like_count, comment_count, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Explore] fetchUserPosts error", error);
    logExploreDevError("fetchUserPosts", error);
    return { items: [], nextCursor: null };
  }

  if (!data || data.length === 0) {
    return { items: [], nextCursor: null };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const items: FeedPost[] = data.map((row) => ({
    id: row.id as string,
    content: row.content as string,
    image_url: row.image_url as string | null,
    created_at: row.created_at as string,
    like_count: (row.like_count as number) ?? 0,
    comment_count: (row.comment_count as number) ?? 0,
    author: {
      id: userId,
      username: profileRow?.username ?? null,
      full_name: profileRow?.full_name ?? null,
      avatar_url: profileRow?.avatar_url ?? null,
    },
  }));

  const nextCursor =
    items.length === limit ? items[items.length - 1].created_at : null;

  return { items, nextCursor };
}

/** Profile user's posts with `liked_by_me` for the viewing user (same pattern as feed). */
export async function fetchUserPostsWithLikes(
  viewerUserId: string | null,
  profileUserId: string,
  pageSize: number,
  cursor?: string,
): Promise<PaginatedResult<FeedPost>> {
  const { items, nextCursor } = await fetchUserPosts({
    userId: profileUserId,
    limit: pageSize,
    cursor,
  });
  if (items.length === 0) {
    return { items: [], nextCursor };
  }
  if (!viewerUserId) {
    return {
      items: items.map((p) => ({ ...p, liked_by_me: false })),
      nextCursor,
    };
  }
  const likedSet = await fetchUserLikedPostIds({
    userId: viewerUserId,
    postIds: items.map((p) => p.id),
  });
  return {
    items: items.map((p) => ({
      ...p,
      liked_by_me: likedSet.has(p.id),
    })),
    nextCursor,
  };
}

/** Resolve a username (or user id) to a full profile row. */
export async function fetchProfileByUsername(
  username: string,
): Promise<ExploreProfile | null> {
  if (!isSupabaseConfigured || !username.trim()) return null;

  const clean = username.trim().toLowerCase().replace(/^@/, "");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified, email_2fa_enabled, created_at")
    .eq("username", clean)
    .maybeSingle();

  if (error) {
    logExploreDevError("fetchProfileByUsername", error);
    return null;
  }

  if (data) return data as ExploreProfile;

  const { data: byId, error: idErr } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_verified, email_2fa_enabled, created_at")
    .eq("id", clean)
    .maybeSingle();

  if (idErr) {
    logExploreDevError("fetchProfileByUsername (id fallback)", idErr);
    return null;
  }

  return byId as ExploreProfile | null;
}

export async function uploadFeedImage(userId: string, file: File): Promise<string> {
  if (!isSupabaseConfigured) return "";

  if (import.meta.env.DEV) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const sessionUid = session?.user?.id ?? null;
    const idsMatch = sessionUid !== null && sessionUid === userId;
    console.log("[Explore:dev] uploadFeedImage — client session present:", !!session, {
      userIdParamMatchesSession: idsMatch,
      hint: !session
        ? "No session in client; Storage requests may omit Authorization → anon role → RLS failure on authenticated INSERT policies."
        : !idsMatch
          ? "userId argument differs from session.user.id; fix callers if unintended."
          : "Session OK; if upload still fails, inspect Network request headers (Authorization, apikey) — see docs/EXPLORE_SETUP.md.",
    });
  }

  try {
    return await storageRepository.uploadFeedImage(userId, file);
  } catch (uploadError) {
    logExploreDevError("uploadFeedImage (feed-images bucket)", uploadError);
    throw uploadError;
  }
}

export async function createPost(params: {
  userId: string;
  content: string;
  imageFile?: File | null;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await postService.createPost({
      userId: params.userId,
      content: params.content,
      imageFile: params.imageFile,
    });
  } catch (error) {
    logExploreDevError("createPost (postService)", error);
    throw error;
  }
}

function extractFeedImagePathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/feed-images/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  const encodedPath = url.slice(idx + marker.length);
  if (!encodedPath) return null;
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

async function tryRemoveFeedImageByPublicUrl(url: string | null | undefined) {
  if (!url) return;
  const path = extractFeedImagePathFromPublicUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from("feed-images").remove([path]);
  if (error) {
    console.warn("[Explore] feed image remove skipped", error);
  }
}

export async function deletePost(params: {
  userId: string;
  postId: string;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const { data: row, error: readError } = await supabase
    .from("posts")
    .select("id, user_id, image_url")
    .eq("id", params.postId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (readError) throw readError;
  if (!row) throw new Error("Post not found or not owned by current user.");

  const { error: deleteError } = await supabase
    .from("posts")
    .delete()
    .eq("id", params.postId)
    .eq("user_id", params.userId);

  if (deleteError) throw deleteError;

  await tryRemoveFeedImageByPublicUrl((row.image_url as string | null) ?? null);
}

export async function fetchUserLikedPostIds(params: {
  userId: string;
  postIds: string[];
}): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set();
  if (!params.userId || params.postIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", params.userId)
    .in("post_id", params.postIds);

  if (error) {
    console.error("[Explore] fetchUserLikedPostIds error", error);
    logExploreDevError("fetchUserLikedPostIds", error);
    return new Set();
  }

  return new Set((data ?? []).map((r) => r.post_id as string));
}

export async function toggleLikePost(params: {
  userId: string;
  postId: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (!params.userId) return;

  const { data: existing, error: existingError } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", params.postId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", params.postId)
      .eq("user_id", params.userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_likes").insert({
      post_id: params.postId,
      user_id: params.userId,
    });
    if (error) throw error;
  }
}

export async function fetchPostComments(params: {
  postId: string;
  limit?: number;
}): Promise<PostComment[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, content, created_at")
    .eq("post_id", params.postId)
    .order("created_at", { ascending: true })
    .limit(params.limit ?? 50);

  if (error) {
    console.error("[Explore] fetchPostComments error", error);
    logExploreDevError("fetchPostComments", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  const userIds = [...new Set(data.map((c) => c.user_id as string))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds);

  if (profileError) {
    console.error("[Explore] fetchPostComments profiles error", profileError);
    logExploreDevError("fetchPostComments (profiles join)", profileError);
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return data.map((row) => {
    const author = profileMap.get(row.user_id as string);
    return {
      id: row.id as string,
      post_id: row.post_id as string,
      content: row.content as string,
      created_at: row.created_at as string,
      author: {
        id: row.user_id as string,
        username: author?.username ?? null,
        full_name: author?.full_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
    };
  });
}

export async function addPostComment(params: {
  userId: string;
  postId: string;
  content: string;
}): Promise<PostComment> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const trimmed = params.content.trim();
  if (!trimmed) {
    throw new Error("Comment cannot be empty.");
  }

  const { data: row, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: params.postId,
      user_id: params.userId,
      content: trimmed,
    })
    .select("id, post_id, user_id, content, created_at")
    .single();

  if (error) throw error;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", row.user_id as string)
    .maybeSingle();

  return {
    id: row.id as string,
    post_id: row.post_id as string,
    content: row.content as string,
    created_at: row.created_at as string,
    author: {
      id: row.user_id as string,
      username: profile?.username ?? null,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    },
  };
}

export async function deletePostComment(params: {
  userId: string;
  postId: string;
  commentId: string;
}): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", params.commentId)
    .eq("post_id", params.postId)
    .eq("user_id", params.userId);

  if (error) throw error;
}



