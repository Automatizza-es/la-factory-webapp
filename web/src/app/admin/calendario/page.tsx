import { CalendarScreen } from "@/components/calendar/CalendarScreen";

interface AdminCalendarPageProps {
  searchParams: Promise<{ fecha?: string; sala?: string; vista?: string }>;
}

// Admins book from the same calendar as coworkers (see CalendarScreen).
export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  return <CalendarScreen role="admin" params={await searchParams} />;
}
