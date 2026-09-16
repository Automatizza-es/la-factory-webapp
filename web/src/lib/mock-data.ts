import type { Booking, Coworker, QuotaSummary, Room } from "@/types/domain";

export const mockCoworker: Coworker = {
  firstName: "Marta",
  initials: "MG",
};

export const mockQuota: QuotaSummary = {
  planCode: "fixed",
  planLabel: "FIXED",
  periodLabel: "Septiembre 2026",
  totalMinutes: 1200,
  usedMinutes: 330,
};

export const mockRooms: Room[] = [
  {
    id: "meeting-room",
    name: "La Meeting Room",
    subtitle: "Sala 1",
    capacityLabel: "2–4 pers.",
  },
  {
    id: "territori-creatiu",
    name: "Territori Creatiu",
    subtitle: "Sala 2",
    capacityLabel: "2–4 pers.",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "bk-1",
    roomId: "meeting-room",
    roomName: "La Meeting Room",
    date: "2026-09-16",
    startMinutes: 10 * 60 + 30,
    endMinutes: 12 * 60,
    status: "upcoming",
  },
  {
    id: "bk-2",
    roomId: "territori-creatiu",
    roomName: "Territori Creatiu",
    date: "2026-09-19",
    startMinutes: 16 * 60,
    endMinutes: 17 * 60 + 30,
    status: "upcoming",
  },
  {
    id: "bk-3",
    roomId: "meeting-room",
    roomName: "La Meeting Room",
    date: "2026-09-08",
    startMinutes: 9 * 60,
    endMinutes: 10 * 60,
    status: "completed",
  },
  {
    id: "bk-4",
    roomId: "territori-creatiu",
    roomName: "Territori Creatiu",
    date: "2026-09-03",
    startMinutes: 11 * 60,
    endMinutes: 12 * 60 + 30,
    status: "cancelled",
  },
];
