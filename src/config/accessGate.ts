export const ACCESS_STORAGE_KEY = "kalvio_access_granted";

function getAccessCode(): string {
  const code = import.meta.env.VITE_ACCESS_CODE?.trim();
  if (!code) {
    console.warn("VITE_ACCESS_CODE is not set — access gate will reject all codes.");
  }
  return code ?? "";
}

export function isAccessGranted(): boolean {
  try {
    return sessionStorage.getItem(ACCESS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function grantAccess(): void {
  sessionStorage.setItem(ACCESS_STORAGE_KEY, "true");
}

export function verifyAccessCode(input: string): boolean {
  const expected = getAccessCode();
  if (!expected) return false;
  return input.trim() === expected;
}
