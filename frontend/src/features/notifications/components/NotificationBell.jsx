// Campanita de notificaciones del navbar: avisa al remitente de una tarea
// cuando el asignado la ve, muestra recordatorios de fecha límite y avisa al
// asignado cuando su tarea fue verificada. Se refresca por polling simple
// (sin websockets) cada 30 segundos.
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent } from "@/shared";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationService";
import { getToken } from "@/features/auth";

const POLL_INTERVAL_MS = 30000;

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.floor(hours / 24)} d`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);

  const load = () => {
    if (!getToken()) return;
    getNotifications().then(setNotifications).catch(console.error);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const handleOpenNotification = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownTrigger>

      <DropdownContent className="w-80 max-w-[90vw] p-0">
        <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
          <p className="text-caption font-semibold">Notificaciones</p>
          {unreadCount > 0 && (
            <button type="button" onClick={handleMarkAllAsRead} className="text-caption text-(--primary-950) underline">
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-center text-caption text-neutral-500">No tienes notificaciones</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpenNotification(notification)}
                className={`block w-full border-b border-neutral-50 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-neutral-50 ${
                  notification.is_read ? "" : "bg-blue-50/60"
                }`}
              >
                <p className="text-caption">{notification.message}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{timeAgo(notification.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
