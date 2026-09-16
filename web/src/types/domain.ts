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
  subtitle: string;
  capacityLabel: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  status: "upcoming" | "completed" | "cancelled";
}

export interface Coworker {
  firstName: string;
  initials: string;
}
