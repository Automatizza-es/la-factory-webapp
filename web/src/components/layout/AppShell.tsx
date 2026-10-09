import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import type { AppRole } from "@/components/layout/nav-items";
import { Sidebar } from "@/components/layout/Sidebar";
import type { NotificationItem } from "@/lib/data/notifications";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Coworker } from "@/types/domain";

interface AppShellProps {
  role: AppRole;
  user: Coworker;
  notifications?: NotificationItem[];
  dict: Dictionary;
  children: React.ReactNode;
}

// The one frame every signed-in page lives in, whatever the role:
// - phone: header + content + bottom tab bar (the "app" feel);
// - tablet/desktop: fixed sidebar on the left, content using the rest.
// Coworker screens cap at a wide-but-readable width (each page lays itself
// out in columns within it); admin screens (tables, calendars) get the
// full width.
export function AppShell({ role, user, notifications, dict, children }: AppShellProps) {
  return (
    <div className="min-h-screen md:pl-60">
      <Sidebar role={role} user={user} />

      <div className="flex min-h-screen flex-col">
        <AppHeader
          coworker={user}
          notifications={notifications}
          notificationsTitle={dict.notifications.title}
          notificationsEmpty={dict.notifications.empty}
          profileHref={role === "admin" ? "/admin/mas" : "/perfil"}
        />
        <main className="flex-1 px-5 py-5 md:px-8 md:py-6">
          <div className={role === "coworker" ? "mx-auto w-full max-w-6xl" : "w-full"}>
            {children}
          </div>
        </main>
        <BottomNav role={role} />
      </div>
    </div>
  );
}
