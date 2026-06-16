import type { AppUser } from "../types/user";
import { requireSupabase } from "./supabaseClient";

export type FeedbackType = "bug" | "idea" | "general";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

function getWeb3FormsAccessKey(): string | null {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  return key || null;
}

async function saveFeedbackToSupabase(
  user: AppUser,
  type: FeedbackType,
  message: string,
  page: string
): Promise<boolean> {
  try {
    const { error } = await requireSupabase().from("feedback").insert({
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      feedback_type: type,
      message,
      page,
    });
    return !error;
  } catch {
    return false;
  }
}

async function sendFeedbackEmail(
  user: AppUser,
  type: FeedbackType,
  message: string,
  page: string
): Promise<boolean> {
  const accessKey = getWeb3FormsAccessKey();
  if (!accessKey) return false;

  const typeLabel =
    type === "bug" ? "Bug report" : type === "idea" ? "Feature idea" : "General feedback";

  const body = new FormData();
  body.append("access_key", accessKey);
  body.append("subject", `Kalvio — ${typeLabel}`);
  body.append("email", user.email);
  body.append("name", user.name || user.email);
  body.append(
    "message",
    `${message}\n\n—\nFrom: ${user.name} (${user.email})\nPage: ${page}\nType: ${typeLabel}`
  );
  body.append("from_name", "Kalvio");

  try {
    const response = await fetch(WEB3FORMS_URL, { method: "POST", body });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function submitFeedback(
  user: AppUser,
  type: FeedbackType,
  message: string,
  page: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = message.trim();
  if (trimmed.length < 5) {
    return { ok: false, message: "Please write at least a few words." };
  }
  if (trimmed.length > 4000) {
    return { ok: false, message: "Feedback is too long (max 4000 characters)." };
  }

  const [saved, emailed] = await Promise.all([
    saveFeedbackToSupabase(user, type, trimmed, page),
    sendFeedbackEmail(user, type, trimmed, page),
  ]);

  if (emailed || saved) {
    return { ok: true };
  }

  return {
    ok: false,
    message: "Could not send feedback. Check your connection and try again.",
  };
}

export function isFeedbackEmailConfigured(): boolean {
  return Boolean(getWeb3FormsAccessKey());
}
