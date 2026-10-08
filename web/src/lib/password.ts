import type { Dictionary } from "@/lib/i18n/dictionaries";

export const MIN_PASSWORD_LENGTH = 8;

// Client-side checks shared by onboarding and the new-password screen.
// Returns the message to show, or null when the pair is fine.
export function validateNewPassword(
  password: string,
  confirm: string,
  dict: Dictionary["password"],
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return dict.tooShort;
  if (password !== confirm) return dict.mismatch;
  return null;
}

// Maps a Supabase updateUser error to our own copy.
export function passwordErrorMessage(
  error: { code?: string; message: string },
  dict: Dictionary["password"],
): string {
  if (error.code === "same_password") return dict.samePassword;
  if (error.code === "weak_password") return dict.tooShort;
  return dict.error;
}
