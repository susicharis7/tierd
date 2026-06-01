import { supabase } from "../lib/supabase";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_URL
)?.trim();

export type EvaluationStep = {
  key: string;
  title: string;
  description: string;
  required: boolean;
  done: boolean;
  actionLabel: string;
  actionHref: string;
};

export type EvaluationReadiness = {
  canEvaluate: boolean;
  completedCount: number;
  totalRequired: number;
  steps: EvaluationStep[];
};

export type EvaluationRun = {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progressPct: number;
  stageKey: string;
  stageLabel: string;
  readiness: Record<string, unknown>;
  signals: Record<string, unknown>;
  deterministicBreakdown: Record<string, unknown>;
  aiFeedback: Record<string, unknown>;
  aiAdjustment: number;
  finalDelta: number;
  scoreBefore: number | null;
  scoreAfter: number | null;
  tierBefore: string | null;
  tierAfter: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type EvaluationStatusResponse = {
  readiness: EvaluationReadiness;
  latestRun: EvaluationRun | null;
  alreadyEvaluated: boolean;
};

export type EvaluationStartResponse = {
  created: boolean;
  readiness: EvaluationReadiness;
  run: EvaluationRun;
};

export class EvaluationApiError extends Error {
  code: string;
  status: number;
  payload: Record<string, unknown>;

  constructor(
    code: string,
    status: number,
    message: string,
    payload: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "EvaluationApiError";
    this.code = code;
    this.status = status;
    this.payload = payload;
  }
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BACKEND_URL) {
    throw new EvaluationApiError(
      "backend_unreachable",
      0,
      "VITE_BACKEND_URL is not configured.",
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new EvaluationApiError("not_signed_in", 401, "Not signed in.");
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error.";
    throw new EvaluationApiError("backend_unreachable", 0, message);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const code = String(payload.error ?? "request_failed");
    const message = String(payload.message ?? `Request failed (${response.status}).`);
    throw new EvaluationApiError(code, response.status, message, payload);
  }

  return payload as T;
}

export const evaluationRepository = {
  getStatus() {
    return apiRequest<EvaluationStatusResponse>("/api/evaluation/status", {
      method: "GET",
    });
  },

  start() {
    return apiRequest<EvaluationStartResponse>("/api/evaluation/start", {
      method: "POST",
      body: "{}",
    });
  },
};
