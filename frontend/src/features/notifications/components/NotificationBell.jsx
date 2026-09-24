// Campanita de notificaciones del navbar: avisa al remitente de una tarea
// cuando el asignado la ve, muestra recordatorios de fecha límite y avisa al
// asignado cuando su tarea fue verificada. Se refresca por polling simple
// (sin websockets) cada 30 segundos.
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent, IconButton } from "@/shared";
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
        <IconButton ariaLabel="Notificaciones" variant="ghost" hitSize={48} iconSize={20} className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </IconButton>
      </DropdownTrigger>

      <DropdownContent className="w-96 max-w-[90vw] p-0">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <p className="text-sm font-semibold">Notificaciones</p>
          {unreadCount > 0 && (
            <button type="button" onClick={handleMarkAllAsRead} className="text-caption text-(--primary-950) underline">
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">No tienes notificaciones</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleOpenNotification(notification)}
                className={`block w-full border-b border-neutral-50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-neutral-50 ${
                  notification.is_read ? "" : "bg-blue-50/60"
                }`}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{timeAgo(notification.created_at)}</p>
              </button>
            ))
          )}
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
