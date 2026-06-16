export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

/** Bump version when shipping user-visible updates */
export const CURRENT_CHANGELOG: ChangelogEntry = {
  version: "0.3.1",
  date: "June 2026",
  title: "What's new in Kalvio",
  items: [
    "Send feedback from any page — bugs, ideas, or general notes go straight to Pavarashan.",
    "Set sessions per class time when adding a subject (e.g. a 4-hour block counts as 4 or 1).",
    "Subject icons now match the course you signed up with.",
    "Cleaner mobile layout on Attendance, calendar, and modals.",
    "Styled confirmation when deleting an academic year.",
    "Your name appears in the top bar next to sign out.",
    "New users start with a blank attendance list — add your own subjects.",
  ],
};

export const CHANGELOG_STORAGE_KEY = "kalvio_changelog_seen_version";

export function hasSeenCurrentChangelog(): boolean {
  try {
    return localStorage.getItem(CHANGELOG_STORAGE_KEY) === CURRENT_CHANGELOG.version;
  } catch {
    return false;
  }
}

export function markChangelogSeen(): void {
  try {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_CHANGELOG.version);
  } catch {
    // ignore
  }
}
