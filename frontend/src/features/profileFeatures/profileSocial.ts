import { supabase } from "../../lib/supabase";

export type SocialProfileListItem = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export async function fetchFollowState(
  viewerId: string | null,
  targetProfileId: string | null,
): Promise<{ isFollowing: boolean }> {
  if (!viewerId || !targetProfileId || viewerId === targetProfileId) {
    return { isFollowing: false };
  }

  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetProfileId)
    .maybeSingle();

  if (error) throw error;
  return { isFollowing: Boolean(data) };
}

export async function followProfile(viewerId: string, targetProfileId: string): Promise<void> {
  if (viewerId === targetProfileId) return;

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: viewerId, following_id: targetProfileId });

  if (error) throw error;
}

export async function unfollowProfile(viewerId: string, targetProfileId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", viewerId)
    .eq("following_id", targetProfileId);

  if (error) throw error;
}

async function fetchProfilesByIdsOrdered(ids: string[]): Promise<SocialProfileListItem[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", ids);

  if (error) throw error;

  const profileMap = new Map((data ?? []).map((row) => [row.id as string, row]));
  return ids
    .map((id) => profileMap.get(id))
    .filter(Boolean)
    .map((row) => ({
      id: row!.id as string,
      username: (row!.username as string | null) ?? null,
      full_name: (row!.full_name as string | null) ?? null,
      avatar_url: (row!.avatar_url as string | null) ?? null,
    }));
}

export async function fetchFollowersList(
  profileId: string,
  limit = 100,
): Promise<SocialProfileListItem[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const ids = (data ?? [])
    .map((row) => row.follower_id as string | null)
    .filter((id): id is string => Boolean(id));

  return fetchProfilesByIdsOrdered(ids);
}

export async function fetchFollowingList(
  profileId: string,
  limit = 100,
): Promise<SocialProfileListItem[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const ids = (data ?? [])
    .map((row) => row.following_id as string | null)
    .filter((id): id is string => Boolean(id));

  return fetchProfilesByIdsOrdered(ids);
}
