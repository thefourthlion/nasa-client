const NASA_HOST = /(^|\.)nasa\.gov$|(^|\.)jpl\.nasa\.gov$/i;

export function apiBase() {
  if (typeof window !== "undefined" && window.location.hostname === "nasa.everettdeleon.com") {
    return "https://apinasa.everettdeleon.com";
  }
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4017";
  return configured.replace(/\/$/, "");
}

export function apiUrl(path) {
  return `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function safeNasaUrl(value) {
  if (typeof value !== "string" || value.length > 2000) return "";
  let url;
  try {
    url = new URL(value);
  } catch {
    return "";
  }
  if (url.username || url.password) return "";
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return "";
  if (!NASA_HOST.test(url.hostname)) return "";
  return url.toString();
}

export function isAllowedUrl(value, hosts) {
  if (typeof value !== "string" || value.length > 2000) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      hosts.includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function safeFilename(title) {
  const cleaned = String(title || "nasa")
    .replace(/[^a-z0-9-_]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return (cleaned || "nasa").slice(0, 80);
}
