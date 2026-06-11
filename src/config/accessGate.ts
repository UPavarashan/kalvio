export const ACCESS_STORAGE_KEY = "kalvio_access_granted";
export const ACCESS_CODE = "KALVIO2024";

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
  return input.trim() === ACCESS_CODE;
}
