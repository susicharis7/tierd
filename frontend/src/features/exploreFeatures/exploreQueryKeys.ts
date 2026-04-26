/** Stable TanStack Query keys for Explore / feed data. */

export const exploreKeys = {
  all: ["explore"] as const,

  profiles: () => [...exploreKeys.all, "profiles"] as const,

  feed: (userId: string | null) =>
    [...exploreKeys.all, "feed", userId ?? "anon"] as const,

  comments: (postId: string) => [...exploreKeys.all, "comments", postId] as const,

  /** Empty string when no active search term (query disabled). */
  search: (debouncedTerm: string) =>
    [...exploreKeys.all, "search", debouncedTerm] as const,

  userPosts: (profileUserId: string, viewerUserId: string | null) =>
    [...exploreKeys.all, "userPosts", profileUserId, viewerUserId ?? "anon"] as const,

  profileByUsername: (username: string) =>
    [...exploreKeys.all, "profileByUsername", username] as const,
};
