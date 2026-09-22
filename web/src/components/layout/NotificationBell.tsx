"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { markNotificationRead } from "@/app/(coworker)/actions";
import type { NotificationItem } from "@/lib/data/notifications";
import { useClickOutside } from "@/lib/use-click-outside";

interface NotificationBellProps {
  notifications: NotificationItem[];
  title: string;
  emptyLabel: string;
}

export function NotificationBell({ notifications, title, emptyLabel }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false));

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleClickNotification(notification: NotificationItem) {
    setOpen(false);
    if (!notification.read) {
      await markNotificationRead(notification.id);
      router.refresh();
    }
    if (notification.linkPath) router.push(notification.linkPath);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand/40"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 max-h-[70vh] w-80 max-w-[85vw] overflow-y-auto rounded-2xl bg-white shadow-xl">
          <div className="border-b border-sand/50 px-4 py-3">
            <p className="text-sm font-semibold text-ink">{title}</p>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-warm-gray">{emptyLabel}</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClickNotification(n)}
                    className={`flex w-full flex-col gap-0.5 border-b border-sand/30 px-4 py-3 text-left last:border-0 ${
                      n.read ? "bg-white" : "bg-cream/60"
                    }`}
                  >
                    <span className="text-sm font-medium text-ink">{n.title}</span>
                    <span className="whitespace-pre-line text-xs text-warm-gray">{n.body}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
