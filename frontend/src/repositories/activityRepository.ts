import { supabase } from "../lib/supabase";

export type ActivityRecordInsert = {
  actor_profile_id?: string | null;
  target_profile_id?: string | null;
  event_type:
    | "follow"
    | "post_created"
    | "post_liked"
    | "post_commented"
    | "challenge_joined"
    | "challenge_submitted"
    | "challenge_won"
    | "verification_completed"
    | "achievement_unlocked";
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  visibility?: "public" | "private";
};

export const activityRepository = {
  async create(activity: ActivityRecordInsert): Promise<void> {
    const { error } = await supabase.from("activity_events").insert({
      actor_profile_id: activity.actor_profile_id ?? null,
      target_profile_id: activity.target_profile_id ?? null,
      event_type: activity.event_type,
      entity_type: activity.entity_type ?? null,
      entity_id: activity.entity_id ?? null,
      metadata: activity.metadata ?? {},
      visibility: activity.visibility ?? "public",
    });

    if (error) throw error;
  },
};

