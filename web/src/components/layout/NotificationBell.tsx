"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { fetchMyNotifications, markAllNotificationsRead } from "@/app/(coworker)/actions";
import type { NotificationItem } from "@/lib/data/notifications";
import { useClickOutside } from "@/lib/use-click-outside";

const POLL_INTERVAL_MS = 30_000;

interface NotificationBellProps {
  notifications: NotificationItem[];
  title: string;
  emptyLabel: string;
}

export function NotificationBell({ notifications, title, emptyLabel }: NotificationBellProps) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [open, setOpen] = useState(false);
  // Ids that were unread when the panel opened: they stay highlighted while
  // it's open even though opening it already marked them as read.
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // A navigation re-renders the layout with fresh server data: take it.
  const [serverNotifications, setServerNotifications] = useState(notifications);
  if (notifications !== serverNotifications) {
    setServerNotifications(notifications);
    setItems(notifications);
  }

  const refresh = useCallback(async () => {
    // Don't swap the list out from under someone who's reading it.
    if (openRef.current || document.visibilityState !== "visible") return;
    setItems(await fetchMyNotifications());
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const close = useCallback(() => {
    setOpen(false);
    setHighlighted(new Set());
  }, []);
  useClickOutside(containerRef, close);

  const unreadCount = items.filter((n) => !n.read).length;

  function handleToggle() {
    if (open) {
      close();
      return;
    }
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    setHighlighted(new Set(unreadIds));
    setOpen(true);
    if (unreadIds.length > 0) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      markAllNotificationsRead();
    }
  }

  function handleClickNotification(notification: NotificationItem) {
    close();
    if (notification.linkPath) router.push(notification.linkPath);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
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
          {items.length === 0 ? (
            <p className="p-4 text-sm text-warm-gray">{emptyLabel}</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClickNotification(n)}
                    className={`flex w-full flex-col gap-0.5 border-b border-sand/30 px-4 py-3 text-left last:border-0 ${
                      highlighted.has(n.id) ? "bg-cream/60" : "bg-white"
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
