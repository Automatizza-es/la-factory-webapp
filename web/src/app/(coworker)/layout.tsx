import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { mockCoworker } from "@/lib/mock-data";

export default function CoworkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col md:my-6 md:min-h-[calc(100vh-3rem)] md:rounded-[2.5rem] md:border md:border-sand/50 md:shadow-xl">
      <AppHeader coworker={mockCoworker} />
      <main className="flex-1 px-5 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
