export type PlanCode = "fixed" | "hot_desk";

export interface QuotaSummary {
  planCode: PlanCode;
  planLabel: string;
  periodLabel: string;
  totalMinutes: number;
  usedMinutes: number;
}

export interface Room {
  id: string;
  name: string;
  capacityMin: number;
  capacityMax: number;
  imagePath: string | null;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomImagePath: string | null;
  date: string;
  startMinutes: number;
  endMinutes: number;
  status: "upcoming" | "completed" | "cancelled";
}

export interface Coworker {
  firstName: string;
  initials: string;
}
