const crypto = require("node:crypto");
const { supabaseAdmin } = require("./supabase");

const CODE_TYPE = "email_2fa";
const TRUST_TYPE = "email_2fa_trust";

const CODE_TTL_MINUTES = Number(process.env.TWO_FACTOR_CODE_TTL_MINUTES || 10);
const TRUST_TTL_DAYS = 7;

function nowIso() {
  return new Date().toISOString();
}

function minutesFromNowIso(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function daysFromNowIso(days) {
  return new Date(Date.now() + days * 24 * 60 * 60_000).toISOString();
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function generateSixDigitCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function generateTrustToken() {
  return crypto.randomBytes(32).toString("hex");
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  if (local.length <= 2) return `${local[0] || "*"}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

async function getProfileSecurityState(profileId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email_2fa_enabled")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw new Error(`profiles read failed: ${error.message}`);

  return {
    exists: Boolean(data?.id),
    email2faEnabled: Boolean(data?.email_2fa_enabled),
  };
}

async function invalidateActive(profileId, verificationType) {
  const { error } = await supabaseAdmin
    .from("user_verifications")
    .update({ used_at: nowIso() })
    .eq("profile_id", profileId)
    .eq("verification_type", verificationType)
    .is("used_at", null)
    .gt("expires_at", nowIso());

  if (error) {
    throw new Error(`user_verifications invalidate failed: ${error.message}`);
  }
}

async function createCodeChallenge(profileId) {
  const code = generateSixDigitCode();
  const expiresAt = minutesFromNowIso(CODE_TTL_MINUTES);

  await invalidateActive(profileId, CODE_TYPE);

  const { error } = await supabaseAdmin.from("user_verifications").insert({
    profile_id: profileId,
    verification_type: CODE_TYPE,
    code_hash: sha256(code),
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`user_verifications insert failed: ${error.message}`);
  }

  return {
    code,
    expiresAt,
    ttlMinutes: CODE_TTL_MINUTES,
  };
}

async function verifyCode(profileId, rawCode) {
  const code = String(rawCode || "").trim();
  if (!/^\d{6}$/.test(code)) return false;

  const { data, error } = await supabaseAdmin
    .from("user_verifications")
    .select("id")
    .eq("profile_id", profileId)
    .eq("verification_type", CODE_TYPE)
    .eq("code_hash", sha256(code))
    .is("used_at", null)
    .gt("expires_at", nowIso())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`user_verifications verify read failed: ${error.message}`);
  }

  if (!data?.id) return false;

  const { error: updateError } = await supabaseAdmin
    .from("user_verifications")
    .update({ used_at: nowIso() })
    .eq("id", data.id)
    .is("used_at", null);

  if (updateError) {
    throw new Error(`user_verifications verify update failed: ${updateError.message}`);
  }

  return true;
}

async function setEmail2faEnabled(profileId, enabled) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ email_2fa_enabled: Boolean(enabled) })
    .eq("id", profileId);

  if (error) {
    throw new Error(`profiles update failed: ${error.message}`);
  }
}

async function createTrustedDevice(profileId) {
  const token = generateTrustToken();
  const tokenHash = sha256(token);
  const expiresAt = daysFromNowIso(TRUST_TTL_DAYS);

  const { error } = await supabaseAdmin.from("user_verifications").insert({
    profile_id: profileId,
    verification_type: TRUST_TYPE,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`trusted-device insert failed: ${error.message}`);
  }

  return {
    token,
    expiresAt,
    maxAgeMs: TRUST_TTL_DAYS * 24 * 60 * 60_000,
  };
}

async function clearTrustedDevices(profileId) {
  await invalidateActive(profileId, TRUST_TYPE);
}

async function hasTrustedDevice(profileId, token) {
  if (!token) return false;

  const { data, error } = await supabaseAdmin
    .from("user_verifications")
    .select("id")
    .eq("profile_id", profileId)
    .eq("verification_type", TRUST_TYPE)
    .eq("token_hash", sha256(token))
    .is("used_at", null)
    .gt("expires_at", nowIso())
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`trusted-device read failed: ${error.message}`);
  }

  return Boolean(data?.id);
}

module.exports = {
  CODE_TTL_MINUTES,
  CODE_TYPE,
  TRUST_TYPE,
  maskEmail,
  getProfileSecurityState,
  createCodeChallenge,
  verifyCode,
  setEmail2faEnabled,
  createTrustedDevice,
  clearTrustedDevices,
  hasTrustedDevice,
};
