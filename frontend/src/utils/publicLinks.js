// frontend/src/utils/publicLinks.js

/**
 * Returns the public base URL used to build shareable links (catalog/join).
 * - Prefer VITE_PUBLIC_BASE_URL (set in .env / Vercel)
 * - Fallback to window.location.origin (safe for most environments)
 */
export function getPublicBaseUrl() {
  const envUrl = import.meta?.env?.VITE_PUBLIC_BASE_URL;
  const trimmed = typeof envUrl === "string" ? envUrl.trim() : "";

  if (trimmed) return trimmed.replace(/\/+$/, ""); // remove trailing slashes

  // Fallback: current origin (works in local/prod if same domain)
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  // Last resort (mainly for SSR-like scenarios; not expected in VINCU)
  return "http://localhost:5173";
}

/**
 * Ensures we have a valid business slug.
 * Accepts either a business object or a slug string.
 */
export function getBusinessSlug(businessOrSlug) {
  if (!businessOrSlug) return "";

  if (typeof businessOrSlug === "string") return businessOrSlug.trim();

  const slug = businessOrSlug?.slug;
  return typeof slug === "string" ? slug.trim() : "";
}

/**
 * Public link: Join / affiliation (creates membership)
 * Format: {BASE_URL}/join/{businessSlug}
 */
export function getJoinUrl(businessOrSlug) {
  const base = getPublicBaseUrl();
  const slug = getBusinessSlug(businessOrSlug);

  if (!slug) return "";
  return `${base}/join/${encodeURIComponent(slug)}`;
}

/**
 * Public link: Rewards catalog
 * Format: {BASE_URL}/catalog/{businessSlug}
 */
export function getCatalogUrl(businessOrSlug) {
  const base = getPublicBaseUrl();
  const slug = getBusinessSlug(businessOrSlug);

  if (!slug) return "";
  return `${base}/catalog/${encodeURIComponent(slug)}`;
}
