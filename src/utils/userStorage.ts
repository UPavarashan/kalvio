const CURRENT_USER_KEY = "kalvio_current_user";

export function scopedStorageKey(userId: string, key: string): string {
  return `kalvio:${userId}:${key}`;
}

export function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}
