const express = require("express");
const { supabaseAdmin } = require("../lib/supabase");
const {
  EvaluationError,
  getEvaluationStatus,
  startEvaluation,
} = require("../services/evaluationService");

const router = express.Router();

async function resolveCaller(req) {
  const header = req.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data?.user) return null;
  return data.user;
}

router.get("/status", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({
      error: "not_signed_in",
      message: "Not signed in.",
    });
  }

  try {
    const status = await getEvaluationStatus(user.id);
    return res.status(200).json(status);
  } catch (err) {
    if (err instanceof EvaluationError) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message,
        ...(err.extra ?? {}),
      });
    }
    console.error("[GET /api/evaluation/status] failed", err);
    return res.status(500).json({
      error: "status_failed",
      message: err?.message ?? "Failed to load evaluation status.",
    });
  }
});

router.post("/start", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({
      error: "not_signed_in",
      message: "Not signed in.",
    });
  }

  try {
    const result = await startEvaluation(user.id);
    return res.status(202).json(result);
  } catch (err) {
    if (err instanceof EvaluationError) {
      return res.status(err.status).json({
        error: err.code,
        message: err.message,
        ...(err.extra ?? {}),
      });
    }
    console.error("[POST /api/evaluation/start] failed", err);
    return res.status(500).json({
      error: "start_failed",
      message: err?.message ?? "Failed to start evaluation.",
    });
  }
});

module.exports = router;
