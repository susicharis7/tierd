import { supabase } from "../lib/supabase";

export type ChallengePhase = "active" | "upcoming" | "past";

export type ChallengeOverviewRow = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  rules: string | null;
  category: string;
  difficulty: string;
  scope: string;
  scope_key: string | null;
  status: string;
  is_featured: boolean;
  reward_points: number;
  max_participants: number | null;
  starts_at: string;
  ends_at: string;
  participants_count: number;
  submissions_count: number;
  winners_count: number;
  phase: ChallengePhase;
  metadata: Record<string, unknown>;
};

export type ChallengeParticipantRow = {
  profile_id: string;
  status: "joined" | "withdrawn" | "disqualified";
  joined_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type ChallengeParticipantWithSubmissionStatus = ChallengeParticipantRow & {
  submission_status: "joined" | "submitted" | "under_review" | "completed" | "expired";
};

export type ChallengeLeaderboardRow = {
  profile_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  position: number | null;
  score: number | null;
  awarded_points: number;
  source: "winners" | "submissions" | "participants";
};

export type ChallengeSubmissionStatus =
  | "draft"
  | "submitted"
  | "reviewed"
  | "rejected"
  | "winner";

export type ChallengeSubmissionRow = {
  id: string;
  challenge_id: string;
  profile_id: string;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  status: ChallengeSubmissionStatus;
  submitted_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

export type UpsertChallengeSubmissionInput = {
  challengeId: string;
  profileId: string;
  repoUrl: string;
  demoUrl?: string;
  description: string;
  testCommand: string;
  demoVideoUrl?: string;
};

function mapOverviewRow(row: Record<string, unknown>): ChallengeOverviewRow {
  const metadataRaw = row.metadata;
  return {
    id: (row.id as string | null) ?? "",
    slug: (row.slug as string | null) ?? null,
    title: (row.title as string | null) ?? "Challenge",
    description: (row.description as string | null) ?? "",
    rules: (row.rules as string | null) ?? null,
    category: (row.category as string | null) ?? "general",
    difficulty: (row.difficulty as string | null) ?? "all_levels",
    scope: (row.scope as string | null) ?? "global",
    scope_key: (row.scope_key as string | null) ?? null,
    status: (row.status as string | null) ?? "draft",
    is_featured: Boolean(row.is_featured),
    reward_points: (row.reward_points as number | null) ?? 0,
    max_participants: (row.max_participants as number | null) ?? null,
    starts_at: (row.starts_at as string | null) ?? new Date().toISOString(),
    ends_at: (row.ends_at as string | null) ?? new Date().toISOString(),
    participants_count: (row.participants_count as number | null) ?? 0,
    submissions_count: (row.submissions_count as number | null) ?? 0,
    winners_count: (row.winners_count as number | null) ?? 0,
    phase: ((row.phase as ChallengePhase | null) ?? "past") as ChallengePhase,
    metadata:
      metadataRaw && typeof metadataRaw === "object"
        ? (metadataRaw as Record<string, unknown>)
        : {},
  };
}

function mapSubmissionRow(row: Record<string, unknown>): ChallengeSubmissionRow {
  const metadataRaw = row.metadata;
  return {
    id: (row.id as string | null) ?? "",
    challenge_id: (row.challenge_id as string | null) ?? "",
    profile_id: (row.profile_id as string | null) ?? "",
    description: (row.description as string | null) ?? null,
    repo_url: (row.repo_url as string | null) ?? null,
    demo_url: (row.demo_url as string | null) ?? null,
    status: ((row.status as ChallengeSubmissionStatus | null) ?? "submitted"),
    submitted_at: (row.submitted_at as string | null) ?? new Date().toISOString(),
    updated_at: (row.updated_at as string | null) ?? new Date().toISOString(),
    metadata:
      metadataRaw && typeof metadataRaw === "object"
        ? (metadataRaw as Record<string, unknown>)
        : {},
  };
}

export const challengeRepository = {
  async listOverview(opts?: {
    phase?: ChallengePhase;
    limit?: number;
    challengeIds?: string[];
  }): Promise<ChallengeOverviewRow[]> {
    let query = supabase
      .from("challenge_public_overview")
      .select(
        "id, slug, title, description, rules, category, difficulty, scope, scope_key, status, is_featured, reward_points, max_participants, starts_at, ends_at, participants_count, submissions_count, winners_count, phase, metadata",
      )
      .order("starts_at", { ascending: false });

    if (opts?.phase) {
      query = query.eq("phase", opts.phase);
    }
    if (opts?.challengeIds?.length) {
      query = query.in("id", opts.challengeIds);
    }
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) =>
      mapOverviewRow(row as Record<string, unknown>),
    );
  },

  async getOverviewById(challengeId: string): Promise<ChallengeOverviewRow | null> {
    const { data, error } = await supabase
      .from("challenge_public_overview")
      .select(
        "id, slug, title, description, rules, category, difficulty, scope, scope_key, status, is_featured, reward_points, max_participants, starts_at, ends_at, participants_count, submissions_count, winners_count, phase, metadata",
      )
      .eq("id", challengeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapOverviewRow(data as Record<string, unknown>);
  },

  async listParticipants(challengeId: string): Promise<ChallengeParticipantRow[]> {
    const { data, error } = await supabase
      .from("challenge_participants")
      .select(
        "profile_id, status, joined_at, profiles:profile_id(username, full_name, avatar_url)",
      )
      .eq("challenge_id", challengeId)
      .eq("status", "joined")
      .order("joined_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const profile = Array.isArray((row as Record<string, unknown>).profiles)
        ? ((row as Record<string, unknown>).profiles as Record<string, unknown>[])[0]
        : ((row as Record<string, unknown>).profiles as Record<string, unknown> | null);
      return {
        profile_id: (row.profile_id as string | null) ?? "",
        status:
          ((row.status as ChallengeParticipantRow["status"] | null) ?? "joined"),
        joined_at: (row.joined_at as string | null) ?? new Date().toISOString(),
        username: (profile?.username as string | null) ?? null,
        full_name: (profile?.full_name as string | null) ?? null,
        avatar_url: (profile?.avatar_url as string | null) ?? null,
      };
    });
  },

  async listParticipantsWithSubmissionStatus(
    challengeId: string,
  ): Promise<ChallengeParticipantWithSubmissionStatus[]> {
    const { data, error } = await supabase
      .from("challenge_participants_with_state")
      .select(
        "challenge_id, profile_id, username, full_name, avatar_url, joined_at, participant_status, submission_status, user_state",
      )
      .eq("challenge_id", challengeId)
      .order("joined_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      profile_id: (row.profile_id as string | null) ?? "",
      status:
        ((row.participant_status as ChallengeParticipantRow["status"] | null) ??
          "joined"),
      joined_at: (row.joined_at as string | null) ?? new Date().toISOString(),
      username: (row.username as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
      submission_status:
        ((row.user_state as ChallengeParticipantWithSubmissionStatus["submission_status"] | null) ??
          "joined"),
    }));
  },

  async listLeaderboard(challengeId: string): Promise<ChallengeLeaderboardRow[]> {
    const { data, error } = await supabase
      .from("challenge_live_leaderboard")
      .select(
        "challenge_id, profile_id, username, full_name, avatar_url, position, score, awarded_points, source",
      )
      .eq("challenge_id", challengeId)
      .order("position", { ascending: true })
      .limit(200);

    if (error) throw error;

    return (data ?? []).map((row) => ({
      profile_id: (row.profile_id as string | null) ?? "",
      username: (row.username as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      avatar_url: (row.avatar_url as string | null) ?? null,
      position: (row.position as number | null) ?? null,
      score: (row.score as number | null) ?? null,
      awarded_points: (row.awarded_points as number | null) ?? 0,
      source:
        ((row.source as ChallengeLeaderboardRow["source"] | null) ??
          "participants"),
    }));
  },

  async getMyParticipantRow(challengeId: string, profileId: string) {
    const { data, error } = await supabase
      .from("challenge_participants")
      .select("challenge_id, profile_id, status, joined_at")
      .eq("challenge_id", challengeId)
      .eq("profile_id", profileId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getMySubmission(
    challengeId: string,
    profileId: string,
  ): Promise<ChallengeSubmissionRow | null> {
    const { data, error } = await supabase
      .from("challenge_submissions")
      .select(
        "id, challenge_id, profile_id, description, repo_url, demo_url, status, submitted_at, updated_at, metadata",
      )
      .eq("challenge_id", challengeId)
      .eq("profile_id", profileId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    return mapSubmissionRow(data[0] as Record<string, unknown>);
  },

  async upsertSubmission(
    input: UpsertChallengeSubmissionInput,
  ): Promise<ChallengeSubmissionRow> {
    const { data, error } = await supabase.rpc("submit_challenge_submission", {
      p_challenge_id: input.challengeId,
      p_repo_url: input.repoUrl,
      p_demo_url: input.demoUrl ?? null,
      p_description: input.description,
      p_test_command: input.testCommand,
      p_demo_video_url: input.demoVideoUrl ?? null,
    });
    if (error) throw error;
    return mapSubmissionRow(data as Record<string, unknown>);
  },

  async getMyChallengeState(challengeId: string) {
    const { data, error } = await supabase
      .from("challenge_my_state")
      .select(
        "challenge_id, profile_id, has_joined, has_submission, submission_status, is_winner, user_state, can_join, can_submit, can_update_submission",
      )
      .eq("challenge_id", challengeId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async join(challengeId: string, profileId: string): Promise<void> {
    const { error } = await supabase.from("challenge_participants").upsert(
      {
        challenge_id: challengeId,
        profile_id: profileId,
        status: "joined",
      },
      { onConflict: "challenge_id,profile_id" },
    );
    if (error) throw error;
  },

  async getMyActiveChallenge(profileId: string): Promise<ChallengeOverviewRow | null> {
    const { data, error } = await supabase
      .from("challenge_participants")
      .select("challenge_id")
      .eq("profile_id", profileId)
      .eq("status", "joined")
      .order("joined_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    const challengeIds = (data ?? [])
      .map((row) => row.challenge_id as string | null)
      .filter((v): v is string => Boolean(v));
    if (challengeIds.length === 0) return null;

    const rows = await this.listOverview({ challengeIds });
    const active = rows
      .filter((row) => row.phase === "active")
      .sort((a, b) => a.ends_at.localeCompare(b.ends_at))[0];
    if (active) return active;

    const upcoming = rows
      .filter((row) => row.phase === "upcoming")
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
    return upcoming ?? null;
  },
};
