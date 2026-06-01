const { supabaseAdmin } = require("../lib/supabase");

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || "llama-3.1-8b-instant").trim();
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

class EvaluationError extends Error {
  constructor(code, status, message, extra = {}) {
    super(message);
    this.name = "EvaluationError";
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundInt(value) {
  return Math.round(toNumber(value, 0));
}

function toIsoNow() {
  return new Date().toISOString();
}

function normalizeRun(row) {
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    progressPct: row.progress_pct,
    stageKey: row.stage_key,
    stageLabel: row.stage_label,
    readiness: row.readiness ?? {},
    signals: row.signals ?? {},
    deterministicBreakdown: row.deterministic_breakdown ?? {},
    aiFeedback: row.ai_feedback ?? {},
    aiAdjustment: row.ai_adjustment ?? 0,
    finalDelta: row.final_delta ?? 0,
    scoreBefore: row.score_before ?? null,
    scoreAfter: row.score_after ?? null,
    tierBefore: row.tier_before ?? null,
    tierAfter: row.tier_after ?? null,
    errorMessage: row.error_message ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

async function getReadiness(profileId) {
  const { data, error } = await supabaseAdmin.rpc(
    "get_profile_evaluation_readiness",
    { p_profile_id: profileId },
  );
  if (error) {
    throw new EvaluationError(
      "readiness_failed",
      500,
      `Failed to compute readiness: ${error.message}`,
    );
  }
  return data ?? {
    canEvaluate: false,
    completedCount: 0,
    totalRequired: 4,
    steps: [],
  };
}

async function getSignalSnapshot(profileId) {
  const { data, error } = await supabaseAdmin.rpc(
    "get_profile_evaluation_signal_snapshot",
    { p_profile_id: profileId },
  );
  if (error) {
    throw new EvaluationError(
      "signals_failed",
      500,
      `Failed to load evaluation signals: ${error.message}`,
    );
  }
  return data ?? {};
}

async function getCurrentScoreTier(profileId) {
  const { data: scoreRow, error: scoreError } = await supabaseAdmin
    .from("profile_scores")
    .select("total_score")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (scoreError) {
    throw new EvaluationError(
      "profile_metrics_failed",
      500,
      `Failed to read profile score: ${scoreError.message}`,
    );
  }

  const rawTotal = toNumber(scoreRow?.total_score, 0);

  const { data: tierRows, error: tierError } = await supabaseAdmin
    .from("tiers")
    .select("code, name, min_score")
    .lte("min_score", rawTotal)
    .order("min_score", { ascending: false })
    .limit(1);

  if (tierError) {
    throw new EvaluationError(
      "profile_tier_failed",
      500,
      `Failed to resolve profile tier: ${tierError.message}`,
    );
  }

  const tierRow = Array.isArray(tierRows) ? tierRows[0] ?? null : null;

  return {
    totalScore: rawTotal,
    tierCode: tierRow?.code ?? "unranked",
    tierName: tierRow?.name ?? "Unranked",
  };
}

async function getLatestRun(profileId) {
  const { data, error } = await supabaseAdmin
    .from("evaluation_runs")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new EvaluationError(
      "run_read_failed",
      500,
      `Failed to read latest evaluation run: ${error.message}`,
    );
  }

  return data ?? null;
}

async function createRun(profileId, readiness) {
  const { data, error } = await supabaseAdmin
    .from("evaluation_runs")
    .insert({
      profile_id: profileId,
      status: "queued",
      progress_pct: 0,
      stage_key: "queued",
      stage_label: "Queued",
      readiness: readiness ?? {},
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new EvaluationError(
        "run_already_active",
        409,
        "An evaluation run is already active for this profile.",
      );
    }
    throw new EvaluationError(
      "run_create_failed",
      500,
      `Failed to create evaluation run: ${error.message}`,
    );
  }

  return data;
}

async function updateRun(runId, patch) {
  const { error } = await supabaseAdmin
    .from("evaluation_runs")
    .update({
      ...patch,
      updated_at: toIsoNow(),
    })
    .eq("id", runId);

  if (error) {
    throw new EvaluationError(
      "run_update_failed",
      500,
      `Failed to update evaluation run: ${error.message}`,
    );
  }
}

async function insertEvaluationScoreEvent(profileId, runId, points, metadata) {
  if (!points) return;

  const { error } = await supabaseAdmin.from("score_events").insert({
    profile_id: profileId,
    points,
    reason_type: "ai_evaluation",
    reason_ref_id: runId,
    metadata: metadata ?? {},
    created_at: toIsoNow(),
  });

  if (error) {
    throw new EvaluationError(
      "score_event_failed",
      500,
      `Failed to write evaluation score event: ${error.message}`,
    );
  }
}

function computeDeterministicBreakdown(snapshot) {
  const github = snapshot?.github ?? {};
  const projects = snapshot?.projects ?? {};
  const activity = snapshot?.activity ?? {};
  const identity = snapshot?.identity ?? {};

  const totalContributions = toNumber(github.totalContributions52w, 0);
  const activeDays = toNumber(github.activeDays52w, 0);
  const projectsTotal = toNumber(projects.total, 0);
  const projectsVerified = toNumber(projects.verified, 0);
  const projectsLive = toNumber(projects.withLiveUrl, 0);
  const postsLast30 = toNumber(activity.postsLast30d, 0);
  const weeklyScore = toNumber(activity.weeklyScore, 0);
  const streakWeeks = toNumber(activity.streakWeeks, 0);
  const challengeSubmissions = toNumber(activity.challengeSubmissions, 0);
  const challengeWins = toNumber(activity.challengeWins, 0);
  const followers = toNumber(activity.followers, 0);

  const githubScore = clamp(roundInt(totalContributions * 0.06 + activeDays * 1.1), 0, 460);
  const projectsScore = clamp(
    roundInt(projectsTotal * 30 + projectsVerified * 70 + projectsLive * 25),
    0,
    340,
  );
  const activityScore = clamp(
    roundInt(
      postsLast30 * 6 +
        weeklyScore * 0.25 +
        streakWeeks * 4 +
        challengeSubmissions * 10 +
        challengeWins * 30 +
        Math.min(followers / 15, 25),
    ),
    0,
    340,
  );
  const verificationScore = clamp(
    roundInt(
      (identity.hasEmail2faEnabled ? 90 : 0) +
        (identity.hasGithubLinked ? 40 : 0) +
        (identity.hasLinkedinLinked ? 20 : 0) +
        (identity.isProfileVerified ? 60 : 0),
    ),
    0,
    210,
  );

  const totalScore = roundInt(
    githubScore + projectsScore + activityScore + verificationScore,
  );

  return {
    totalScore,
    components: [
      {
        source: "github",
        score: githubScore,
        explanation: `${totalContributions} contributions across ${activeDays} active days (52w).`,
      },
      {
        source: "projects",
        score: projectsScore,
        explanation: `${projectsTotal} projects, ${projectsVerified} verified, ${projectsLive} with live URLs.`,
      },
      {
        source: "activity",
        score: activityScore,
        explanation: `${postsLast30} posts/30d, streak ${streakWeeks}w, ${challengeSubmissions} submissions, ${challengeWins} wins.`,
      },
      {
        source: "verification",
        score: verificationScore,
        explanation: "Identity, account security, and profile verification signals.",
      },
    ],
  };
}

function parseJsonObject(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const sliced = text.slice(start, end + 1);
      try {
        return JSON.parse(sliced);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function runAiAdjustment(snapshot, deterministic) {
  if (!GROQ_API_KEY) {
    return {
      adjustment: 0,
      summary: "AI adjustment skipped (missing GROQ_API_KEY).",
      strengths: [],
      concerns: [],
      recommendations: [],
    };
  }

  const prompt = {
    signals: snapshot,
    deterministic,
    instruction:
      "Return strict JSON only. Fields: adjustment (integer in range -120..120), summary (string), strengths (string[] max 3), concerns (string[] max 3), recommendations (string[] max 3).",
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a strict evaluator for developer ranking fairness. Output JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const content =
    payload?.choices?.[0]?.message?.content ??
    payload?.choices?.[0]?.text ??
    "";
  const parsed = parseJsonObject(content) ?? {};

  const adjustment = clamp(roundInt(parsed.adjustment), -120, 120);
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : "AI evaluation completed.";
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.slice(0, 3).map((v) => String(v))
    : [];
  const concerns = Array.isArray(parsed.concerns)
    ? parsed.concerns.slice(0, 3).map((v) => String(v))
    : [];
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.slice(0, 3).map((v) => String(v))
    : [];

  return {
    adjustment,
    summary,
    strengths,
    concerns,
    recommendations,
  };
}

async function processEvaluationRun(runId, profileId) {
  try {
    await updateRun(runId, {
      status: "running",
      progress_pct: 10,
      stage_key: "collect_signals",
      stage_label: "Collecting profile signals",
      started_at: toIsoNow(),
    });

    const readiness = await getReadiness(profileId);
    if (!readiness?.canEvaluate) {
      throw new EvaluationError(
        "requirements_incomplete",
        400,
        "Evaluation requirements are not complete.",
      );
    }

    const snapshot = await getSignalSnapshot(profileId);
    const before = await getCurrentScoreTier(profileId);

    await updateRun(runId, {
      progress_pct: 35,
      stage_key: "deterministic_score",
      stage_label: "Calculating deterministic score",
      readiness,
      signals: snapshot,
      score_before: before.totalScore,
      tier_before: before.tierCode ?? before.tierName,
    });

    const deterministic = computeDeterministicBreakdown(snapshot);

    await updateRun(runId, {
      progress_pct: 65,
      stage_key: "ai_review",
      stage_label: "Running AI evaluation",
      deterministic_breakdown: deterministic,
    });

    let ai = {
      adjustment: 0,
      summary: "AI adjustment not available.",
      strengths: [],
      concerns: [],
      recommendations: [],
    };
    try {
      ai = await runAiAdjustment(snapshot, deterministic);
    } catch (err) {
      ai = {
        adjustment: 0,
        summary: `AI fallback used: ${err?.message ?? "unknown error"}`,
        strengths: [],
        concerns: [],
        recommendations: [],
      };
    }

    const targetScore = Math.max(
      0,
      roundInt(deterministic.totalScore + toNumber(ai.adjustment, 0)),
    );
    const finalDelta = targetScore - before.totalScore;

    await updateRun(runId, {
      progress_pct: 90,
      stage_key: "apply_score",
      stage_label: "Applying final score",
      ai_feedback: ai,
      ai_adjustment: ai.adjustment,
      final_delta: finalDelta,
    });

    await insertEvaluationScoreEvent(profileId, runId, finalDelta, {
      target_score: targetScore,
      score_before: before.totalScore,
      deterministic,
      ai,
    });

    const after = await getCurrentScoreTier(profileId);

    await updateRun(runId, {
      status: "completed",
      progress_pct: 100,
      stage_key: "completed",
      stage_label: "Evaluation completed",
      score_after: after.totalScore,
      tier_after: after.tierCode ?? after.tierName,
      completed_at: toIsoNow(),
      error_message: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evaluation failed.";
    try {
      await updateRun(runId, {
        status: "failed",
        progress_pct: 100,
        stage_key: "failed",
        stage_label: "Evaluation failed",
        error_message: message,
        completed_at: toIsoNow(),
      });
    } catch (updateErr) {
      console.error("[evaluation] failed to mark run as failed", updateErr);
    }
    console.error("[evaluation] run failed", { runId, profileId, err });
  }
}

async function getEvaluationStatus(profileId) {
  const [readiness, latest] = await Promise.all([
    getReadiness(profileId),
    getLatestRun(profileId),
  ]);

  return {
    readiness,
    latestRun: normalizeRun(latest),
    alreadyEvaluated: latest?.status === "completed",
  };
}

async function startEvaluation(profileId) {
  const readiness = await getReadiness(profileId);
  if (!readiness?.canEvaluate) {
    throw new EvaluationError(
      "requirements_incomplete",
      400,
      "Complete all required steps before evaluation.",
      { readiness },
    );
  }

  const latest = await getLatestRun(profileId);
  if (latest?.status === "completed") {
    throw new EvaluationError(
      "already_evaluated",
      409,
      "Profile has already been evaluated.",
      { latestRun: normalizeRun(latest) },
    );
  }

  if (latest?.status === "queued" || latest?.status === "running") {
    return {
      created: false,
      readiness,
      run: normalizeRun(latest),
    };
  }

  const run = await createRun(profileId, readiness);
  setTimeout(() => {
    void processEvaluationRun(run.id, profileId);
  }, 0);

  return {
    created: true,
    readiness,
    run: normalizeRun(run),
  };
}

module.exports = {
  EvaluationError,
  getEvaluationStatus,
  startEvaluation,
};
