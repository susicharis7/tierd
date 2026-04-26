import type { ExploreProfile, FeedPost } from "./exploreTypes";

export function authorInitial(
  profile: ExploreProfile | FeedPost["author"],
): string {
  const source = profile.full_name || profile.username || "U";
  return source.charAt(0).toUpperCase();
}

export function authorDisplayName(profile: {
  full_name: string | null;
  username: string | null;
}): string {
  return (
    profile.full_name?.trim() ||
    (profile.username ? `@${profile.username}` : "Anonymous Builder")
  );
}

export function authorHandleStr(username: string | null): string {
  return username?.trim() ? `@${username}` : "@new_builder";
}


