import { CalendarScreen } from "@/components/calendar/CalendarScreen";

interface CalendarioPageProps {
  searchParams: Promise<{ fecha?: string; sala?: string; vista?: string }>;
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  return <CalendarScreen role="coworker" params={await searchParams} />;
}
