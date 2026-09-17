import { formatMinutesAsHours } from "@/lib/format";
import type { Dictionary } from "./dictionaries";

interface RpcError {
  message: string;
  details?: string | null;
}

function parseDetail(details: string | null | undefined): Record<string, unknown> {
  if (!details) return {};
  try {
    return JSON.parse(details);
  } catch {
    return {};
  }
}

// Postgres RAISE EXCEPTION 'CODE' surfaces as error.message = 'CODE' and
// any USING detail = json(...) as error.details. Translating by code
// keeps the message locale-independent at the database layer.
export function translateBookingError(error: RpcError, dict: Dictionary["errors"]): string {
  const detail = parseDetail(error.details);

  switch (error.message) {
    case "NOT_AUTHORIZED":
      return dict.notAuthorized;
    case "INVALID_TIME_RANGE":
      return dict.invalidTimeRange;
    case "BOOKING_MUST_BE_FUTURE":
      return dict.mustBeFuture;
    case "SAME_DAY_REQUIRED":
      return dict.sameDayRequired;
    case "ROOM_UNAVAILABLE":
      return dict.roomUnavailable;
    case "NO_ACTIVE_PLAN":
      return dict.noActivePlan;
    case "WEEKEND_NOT_ALLOWED":
      return dict.weekendNotAllowed(String(detail.plan ?? ""));
    case "NO_SCHEDULE_FOR_DAY":
      return dict.noScheduleForDay(String(detail.plan ?? ""));
    case "OUTSIDE_SCHEDULE_WINDOW":
      return dict.outsideScheduleWindow(
        String(detail.plan ?? ""),
        `${detail.windowStart}-${detail.windowEnd}`,
      );
    case "INSUFFICIENT_QUOTA":
      return dict.insufficientQuota(
        formatMinutesAsHours(Number(detail.availableMinutes ?? 0)),
        formatMinutesAsHours(Number(detail.neededMinutes ?? 0)),
      );
    case "ROOM_OVERLAP":
      return dict.roomOverlap;
    case "BOOKING_NOT_FOUND":
      return dict.bookingNotFound;
    case "ALREADY_CANCELLED":
      return dict.alreadyCancelled;
    case "ALREADY_STARTED":
      return dict.alreadyStarted;
    case "ORIGINAL_BOOKING_NOT_FOUND":
      return dict.originalNotFound;
    default:
      return dict.unknown;
  }
}
