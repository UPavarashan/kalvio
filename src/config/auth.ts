/** Where Supabase should send users after email confirmation */
export function getEmailRedirectUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://www.kalvio.org";
}
