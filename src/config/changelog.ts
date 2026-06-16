export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

/** Bump version when shipping user-visible updates */
export const CURRENT_CHANGELOG: ChangelogEntry = {
  version: "0.3.0",
  date: "June 2026",
  title: "What's new in Kalvio",
  items: [
    "Set number of sessions per class time — e.g. a 4-hour block can count as 4 or 1.",
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
