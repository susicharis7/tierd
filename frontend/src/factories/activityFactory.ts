export type ActivityType =
  | "post_created"
  | "post_liked"
  | "post_commented"
  | "challenge_joined"
  | "github_connected"
  | "tier_claimed";

export type Activity = {
  user_id: string;
  type: ActivityType;
  message: string;
  points: number;
  metadata?: Record<string, unknown>;
};

export const activityFactory = {
  createPostActivity(userId: string, postId: string): Activity {
    return {
      user_id: userId,
      type: "post_created",
      message: "Created a new post",
      points: 10,
      metadata: { post_id: postId },
    };
  },

  createLikeActivity(userId: string, postId: string): Activity {
    return {
      user_id: userId,
      type: "post_liked",
      message: "Liked a post",
      points: 2,
      metadata: { post_id: postId },
    };
  },

  createCommentActivity(
    userId: string,
    postId: string,
    commentId: string,
  ): Activity {
    return {
      user_id: userId,
      type: "post_commented",
      message: "Commented on a post",
      points: 3,
      metadata: { post_id: postId, comment_id: commentId },
    };
  },

  createChallengeActivity(userId: string, challengeId: string): Activity {
    return {
      user_id: userId,
      type: "challenge_joined",
      message: "Joined a challenge",
      points: 0,
      metadata: { challenge_id: challengeId },
    };
  },

  createGithubActivity(userId: string, githubUsername: string): Activity {
    return {
      user_id: userId,
      type: "github_connected",
      message: "Connected GitHub account",
      points: 0,
      metadata: { github_username: githubUsername },
    };
  },

  createTierClaimActivity(userId: string, tier: string): Activity {
    return {
      user_id: userId,
      type: "tier_claimed",
      message: `Claimed tier ${tier}`,
      points: 0,
      metadata: { tier },
    };
  },
};

