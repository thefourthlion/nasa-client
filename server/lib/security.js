const crypto = require("crypto");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BANNED_SECRETS = new Set([
  "replace-with-a-long-random-string",
  "change-me",
  "changeme",
  "password",
  "admin",
]);

function isRealDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1995 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseBoundedInt(value, { fallback, min, max }) {
  if (value === undefined) return { ok: true, value: fallback };
  if (Array.isArray(value) || typeof value !== "string" || !/^\d+$/.test(value)) {
    return { ok: false };
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false };
  return { ok: true, value: n };
}

function asPlainString(value, max) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(trimmed)) return null;
  return trimmed;
}

function isObjectId(value) {
  return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

function toNasaHttps(value) {
  const text = asPlainString(value, 2000);
  if (!text) return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const nasaHost =
    host === "nasa.gov" || host.endsWith(".nasa.gov") || host.endsWith(".jpl.nasa.gov");
  if (!nasaHost) return null;
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return null;
  return url.toString();
}

function isSafeHttpsUrl(value) {
  const text = asPlainString(value, 2000);
  if (!text) return false;
  let url;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return false;
  }
  if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  return true;
}

function normalizeUrl(value) {
  return toNasaHttps(value) || (isSafeHttpsUrl(value) ? value.trim() : null);
}

function secretOk(value) {
  return typeof value === "string" && value.length >= 24 && !BANNED_SECRETS.has(value);
}

function tokensMatch(provided, expected) {
  const a = crypto.createHash("sha256").update(String(provided)).digest();
  const b = crypto.createHash("sha256").update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

function clientOrigins() {
  const raw = process.env.CLIENT_ORIGIN;
  const list = raw
    ? raw.split(",").map((item) => item.trim()).filter(Boolean)
    : [
        "http://localhost:4016",
        "http://127.0.0.1:4016",
        "https://nasa.everettdeleon.com",
      ];
  return list.filter((origin) => {
    try {
      const url = new URL(origin);
      return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
    } catch {
      return false;
    }
  });
}

module.exports = {
  isRealDate,
  parseBoundedInt,
  asPlainString,
  isObjectId,
  toNasaHttps,
  isSafeHttpsUrl,
  normalizeUrl,
  secretOk,
  tokensMatch,
  clientOrigins,
};
