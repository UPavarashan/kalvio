/** Production site URL for Supabase email redirects */
export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://www.kalvio.org";
}

export function hasAuthCallbackInUrl(): boolean {
  if (typeof window === "undefined") return false;

  const { hash, search } = window.location;
  if (hash.includes("access_token=") || hash.includes("type=signup") || hash.includes("type=recovery")) {
    return true;
  }

  const params = new URLSearchParams(search);
  return params.has("code") || params.get("type") === "signup";
}
