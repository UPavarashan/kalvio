import { isAccessCodeConfigured } from "./accessGate";
import { isSupabaseConfigured } from "../utils/supabaseClient";

export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!isSupabaseConfigured) {
    missing.push("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY");
  }
  if (!isAccessCodeConfigured()) {
    missing.push("VITE_ACCESS_CODE");
  }
  return missing;
}

export function isAppConfigured(): boolean {
  return getMissingEnvVars().length === 0;
}

export function getConfigErrorMessage(): string | null {
  const missing = getMissingEnvVars();
  if (missing.length === 0) return null;

  return [
    "This deployment is missing required environment variables:",
    "",
    ...missing.map((name) => `• ${name}`),
    "",
    "If you're on Vercel, add them under Project → Settings → Environment Variables, then redeploy.",
  ].join("\n");
}
