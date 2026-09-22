import type { Dictionary } from "./dictionaries";

interface RpcError {
  message: string;
}

export function translateOnboardingError(
  error: RpcError,
  dict: Dictionary["errors"],
  onboardingDict: Dictionary["onboarding"],
): string {
  switch (error.message) {
    case "INVITATION_NOT_FOUND":
      return onboardingDict.errorNotFound;
    case "INVITATION_CANCELLED":
      return onboardingDict.errorCancelled;
    case "INVITATION_EXPIRED":
      return onboardingDict.errorExpired;
    case "NOT_AUTHORIZED":
      return dict.notAuthorized;
    default:
      return dict.unknown;
  }
}
