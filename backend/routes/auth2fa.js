const express = require("express");
const { supabaseAdmin } = require("../lib/supabase");
const {
  TRUST_COOKIE_NAME,
  parseCookieHeader,
} = require("../lib/http");
const {
  CODE_TTL_MINUTES,
  maskEmail,
  getProfileSecurityState,
  createCodeChallenge,
  verifyCode,
  setEmail2faEnabled,
  createTrustedDevice,
  clearTrustedDevices,
  hasTrustedDevice,
} = require("../lib/twoFactor");
const { sendTwoFactorCodeEmail } = require("../services/mailService");

const router = express.Router();

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

async function resolveCaller(req) {
  const header = req.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data?.user) return null;
  return data.user;
}

function getTrustCookie(req) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  return cookies[TRUST_COOKIE_NAME] ?? null;
}

async function issueCodeAndSendEmail(profileId, email) {
  const { code, ttlMinutes } = await createCodeChallenge(profileId);
  await sendTwoFactorCodeEmail({
    to: email,
    code,
    ttlMinutes,
  });
}

router.get("/status", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  try {
    const state = await getProfileSecurityState(user.id);
    if (!state.exists) {
      return res.status(404).json({ error: "profile_missing", message: "Profile not found." });
    }

    if (!state.email2faEnabled) {
      return res.status(200).json({
        enabled: false,
        requiresVerification: false,
        hasTrustedDevice: false,
        emailMasked: maskEmail(user.email),
      });
    }

    const trusted = await hasTrustedDevice(user.id, getTrustCookie(req));

    return res.status(200).json({
      enabled: true,
      requiresVerification: !trusted,
      hasTrustedDevice: trusted,
      emailMasked: maskEmail(user.email),
    });
  } catch (err) {
    console.error("[GET /api/auth/2fa/status] failed", err);
    return res.status(500).json({ error: "status_failed", message: err.message ?? "Status failed." });
  }
});

router.post("/setup/init", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  try {
    const state = await getProfileSecurityState(user.id);
    if (!state.exists) {
      return res.status(404).json({ error: "profile_missing", message: "Profile not found." });
    }
    if (state.email2faEnabled) {
      return res.status(400).json({ error: "already_enabled", message: "Email 2FA is already enabled." });
    }
    if (!user.email) {
      return res.status(400).json({ error: "email_missing", message: "No email is available for this account." });
    }

    await issueCodeAndSendEmail(user.id, user.email);

    return res.status(200).json({
      ok: true,
      ttlMinutes: CODE_TTL_MINUTES,
      emailMasked: maskEmail(user.email),
    });
  } catch (err) {
    console.error("[POST /api/auth/2fa/setup/init] failed", err);
    return res.status(500).json({ error: "setup_init_failed", message: err.message ?? "Setup init failed." });
  }
});

router.post("/setup/verify", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  const code = String(req.body?.code ?? "");
  try {
    const ok = await verifyCode(user.id, code);
    if (!ok) {
      return res.status(401).json({ error: "invalid_code", message: "Invalid or expired code." });
    }

    await setEmail2faEnabled(user.id, true);

    return res.status(200).json({ ok: true, enabled: true });
  } catch (err) {
    console.error("[POST /api/auth/2fa/setup/verify] failed", err);
    return res.status(500).json({ error: "setup_verify_failed", message: err.message ?? "Setup verify failed." });
  }
});

router.post("/challenge/resend", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  try {
    const state = await getProfileSecurityState(user.id);
    if (!state.email2faEnabled) {
      return res.status(400).json({ error: "not_enabled", message: "Email 2FA is not enabled." });
    }
    if (!user.email) {
      return res.status(400).json({ error: "email_missing", message: "No email is available for this account." });
    }

    await issueCodeAndSendEmail(user.id, user.email);

    return res.status(200).json({ ok: true, ttlMinutes: CODE_TTL_MINUTES });
  } catch (err) {
    console.error("[POST /api/auth/2fa/challenge/resend] failed", err);
    return res.status(500).json({ error: "challenge_resend_failed", message: err.message ?? "Resend failed." });
  }
});

router.post("/challenge/verify", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  const code = String(req.body?.code ?? "");
  const rememberDevice = Boolean(req.body?.rememberDevice);

  try {
    const state = await getProfileSecurityState(user.id);
    if (!state.email2faEnabled) {
      return res.status(400).json({ error: "not_enabled", message: "Email 2FA is not enabled." });
    }

    const ok = await verifyCode(user.id, code);
    if (!ok) {
      return res.status(401).json({ error: "invalid_code", message: "Invalid or expired code." });
    }

    if (rememberDevice) {
      const trusted = await createTrustedDevice(user.id);
      res.cookie(TRUST_COOKIE_NAME, trusted.token, cookieOptions(trusted.maxAgeMs));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/2fa/challenge/verify] failed", err);
    return res.status(500).json({ error: "challenge_verify_failed", message: err.message ?? "Verify failed." });
  }
});

router.post("/disable", async (req, res) => {
  const user = await resolveCaller(req);
  if (!user) {
    return res.status(401).json({ error: "not_signed_in", message: "Not signed in." });
  }

  const code = String(req.body?.code ?? "");

  try {
    const state = await getProfileSecurityState(user.id);
    if (!state.email2faEnabled) {
      res.clearCookie(TRUST_COOKIE_NAME, cookieOptions(0));
      return res.status(200).json({ ok: true, enabled: false });
    }

    const ok = await verifyCode(user.id, code);
    if (!ok) {
      return res.status(401).json({ error: "invalid_code", message: "Invalid or expired code." });
    }

    await setEmail2faEnabled(user.id, false);
    await clearTrustedDevices(user.id);

    res.clearCookie(TRUST_COOKIE_NAME, cookieOptions(0));

    return res.status(200).json({ ok: true, enabled: false });
  } catch (err) {
    console.error("[POST /api/auth/2fa/disable] failed", err);
    return res.status(500).json({ error: "disable_failed", message: err.message ?? "Disable failed." });
  }
});

module.exports = router;
