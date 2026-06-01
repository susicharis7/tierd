import { supabase } from "../lib/supabase";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_URL
)?.trim();

export type TwoFactorStatus = {
  enabled: boolean;
  requiresVerification: boolean;
  hasTrustedDevice: boolean;
  challengeSent?: boolean;
  emailMasked: string | null;
};

export class TwoFactorApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "TwoFactorApiError";
    this.code = code;
    this.status = status;
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
    throw new TwoFactorApiError(
      "backend_unreachable",
      0,
      "VITE_BACKEND_URL is not configured.",
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new TwoFactorApiError("not_signed_in", 401, "Not signed in.");
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
    throw new TwoFactorApiError("backend_unreachable", 0, message);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    // keep payload empty
  }

  if (!response.ok) {
    const code = String(payload.error ?? "request_failed");
    const message = String(payload.message ?? `Request failed (${response.status}).`);
    throw new TwoFactorApiError(code, response.status, message);
  }

  return payload as T;
}

export const twoFactorRepository = {
  async getStatus() {
    return apiRequest<TwoFactorStatus>("/api/auth/2fa/status", {
      method: "GET",
    });
  },

  async initSetup() {
    return apiRequest<{ ok: true; ttlMinutes: number; emailMasked: string | null }>(
      "/api/auth/2fa/setup/init",
      { method: "POST", body: "{}" },
    );
  },

  async verifySetup(input: { code: string }) {
    return apiRequest<{ ok: true; enabled: true }>("/api/auth/2fa/setup/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async resendChallenge() {
    return apiRequest<{ ok: true; ttlMinutes: number }>(
      "/api/auth/2fa/challenge/resend",
      { method: "POST", body: "{}" },
    );
  },

  async verifyChallenge(input: { code: string; rememberDevice: boolean }) {
    return apiRequest<{ ok: true }>("/api/auth/2fa/challenge/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async disable(input: { code: string }) {
    return apiRequest<{ ok: true; enabled: false }>("/api/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
