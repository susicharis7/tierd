import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/ui/sonner";
import { getExploreActionableMessage } from "../exploreFeatures/exploreErrors";
import { invalidateRankingQueries } from "../rankingFeatures/rankingCache";
import {
  fetchFollowersList,
  fetchFollowingList,
  fetchFollowState,
  followProfile,
  unfollowProfile,
} from "./profileSocial";

const PROFILE_SOCIAL_STALE_MS = 15_000;

export const profileSocialKeys = {
  followState: (viewerId: string | null, targetProfileId: string | null) =>
    ["profile-social", "follow-state", viewerId, targetProfileId] as const,
  followers: (profileId: string | null) =>
    ["profile-social", "followers", profileId] as const,
  following: (profileId: string | null) =>
    ["profile-social", "following", profileId] as const,
};

export function useFollowStateQuery(
  viewerId: string | null,
  targetProfileId: string | null,
  isOwnProfile: boolean,
) {
  return useQuery({
    queryKey: profileSocialKeys.followState(viewerId, targetProfileId),
    queryFn: () => fetchFollowState(viewerId, targetProfileId),
    enabled: Boolean(viewerId && targetProfileId && !isOwnProfile),
    staleTime: PROFILE_SOCIAL_STALE_MS,
  });
}

export function useFollowersListQuery(profileId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: profileSocialKeys.followers(profileId),
    queryFn: () => fetchFollowersList(profileId!),
    enabled: Boolean(profileId && enabled),
    staleTime: PROFILE_SOCIAL_STALE_MS,
  });
}

export function useFollowingListQuery(profileId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: profileSocialKeys.following(profileId),
    queryFn: () => fetchFollowingList(profileId!),
    enabled: Boolean(profileId && enabled),
    staleTime: PROFILE_SOCIAL_STALE_MS,
  });
}

export function useToggleFollowMutation(viewerId: string | null, targetProfileId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isCurrentlyFollowing: boolean) => {
      if (!viewerId || !targetProfileId) {
        throw new Error("Missing follower or target profile id.");
      }

      if (isCurrentlyFollowing) {
        await unfollowProfile(viewerId, targetProfileId);
      } else {
        await followProfile(viewerId, targetProfileId);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileSocialKeys.followState(viewerId, targetProfileId) }),
        queryClient.invalidateQueries({ queryKey: profileSocialKeys.followers(targetProfileId) }),
        queryClient.invalidateQueries({ queryKey: profileSocialKeys.following(targetProfileId) }),
        queryClient.invalidateQueries({ queryKey: profileSocialKeys.following(viewerId) }),
        invalidateRankingQueries(queryClient),
      ]);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Follow action failed.";
      toast(getExploreActionableMessage(err) ?? msg);
    },
  });
}
