export const ACCESS_STORAGE_KEY = "kalvio_beta_access";

/** Set in `.env` as VITE_ACCESS_CODE=your-code */
export function getAccessCode(): string {
  return import.meta.env.VITE_ACCESS_CODE ?? "";
}

export function isAccessGranted(): boolean {
  try {
    return sessionStorage.getItem(ACCESS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function grantAccess(): void {
  sessionStorage.setItem(ACCESS_STORAGE_KEY, "1");
}

export function verifyAccessCode(input: string): boolean {
  const expected = getAccessCode();
  if (!expected) return false;
  return input.trim() === expected;
}
