const TRUST_COOKIE_NAME = "tierd_2fa_trust";

function parseAllowedOrigins(raw) {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCorsOptions(allowedOrigins) {
  const allowAll = allowedOrigins.length === 0;
  return {
    origin(origin, callback) {
      if (!origin || allowAll || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  };
}

function parseCookieHeader(header) {
  const out = {};
  if (!header) return out;

  const parts = String(header).split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(value);
  }

  return out;
}

module.exports = {
  TRUST_COOKIE_NAME,
  parseAllowedOrigins,
  buildCorsOptions,
  parseCookieHeader,
};
