// Campanita de notificaciones del navbar: avisa al remitente de una tarea
// cuando el asignado la ve, muestra recordatorios de fecha límite y avisa al
// asignado cuando su tarea fue verificada. Se refresca por polling simple
// (sin websockets) cada 30 segundos.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ClipboardList, HandCoins } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent, IconButton } from "@/shared";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationService";
import { getToken, getCurrentUser, isSuperUser } from "@/features/auth";
import { getTareas } from "@/features/tareas/services/tareaService";
import { getPrestamos } from "@/features/prestamos/services/prestamoService";
import { TASK_STATUS_OPTIONS } from "@/features/tareas/services/tareaOptionsService";
import { getPrestamoStatus, PRESTAMO_STATUS_STYLES } from "@/features/prestamos/services/prestamoStatus";

const POLL_INTERVAL_MS = 30000;

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  // Resumen segun el rol: a un usuario estandar se le muestran sus propias
  // tareas asignadas; a un super administrador, los ultimos 5 prestamos.
  const [myTareas, setMyTareas] = useState([]);
  const [recentPrestamos, setRecentPrestamos] = useState([]);
  const isAdmin = isSuperUser();
  const currentUserId = getCurrentUser()?.id;

  const load = () => {
    if (!getToken()) return;
    getNotifications().then(setNotifications).catch(console.error);

    if (isAdmin) {
      getPrestamos()
        .then((data) => {
          const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => b.id - a.id);
          setRecentPrestamos(sorted.slice(0, 5));
        })
        .catch(console.error);
    } else {
      getTareas()
        .then((data) => {
          const mine = (Array.isArray(data) ? data : []).filter((tarea) =>
            (tarea.assigned_users ?? []).some((id) => String(id) === String(currentUserId)),
          );
          setMyTareas(mine);
        })
        .catch(console.error);
    }
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
        <div className="border-b border-neutral-100 px-4 py-3">
          <p className="mb-2 text-sm font-semibold">
            {isAdmin ? "Últimos préstamos" : "Mis tareas asignadas"}
          </p>

          {isAdmin ? (
            recentPrestamos.length === 0 ? (
              <p className="text-caption text-neutral-500">No hay préstamos registrados</p>
            ) : (
              <div className="flex flex-col gap-1">
                {recentPrestamos.map((prestamo) => {
                  const status = getPrestamoStatus(prestamo);
                  return (
                    <button
                      key={prestamo.id}
                      type="button"
                      onClick={() => navigate(`/dashboard/prestamos/${prestamo.id}/ticket`)}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-caption transition-colors hover:bg-neutral-50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <HandCoins size={14} className="shrink-0 text-neutral-400" />
                        <span className="truncate">Préstamo #{prestamo.id}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${PRESTAMO_STATUS_STYLES[status.id]}`}>
                        {status.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          ) : myTareas.length === 0 ? (
            <p className="text-caption text-neutral-500">No tienes tareas asignadas</p>
          ) : (
            <div className="flex flex-col gap-1">
              {myTareas.slice(0, 5).map((tarea) => (
                <button
                  key={tarea.id}
                  type="button"
                  onClick={() => navigate("/dashboard/mis-tareas")}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-caption transition-colors hover:bg-neutral-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ClipboardList size={14} className="shrink-0 text-neutral-400" />
                    <span className="truncate">{tarea.task_name}</span>
                  </span>
                  <span className="shrink-0 text-neutral-400">{findLabel(TASK_STATUS_OPTIONS, tarea.status)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigate("/dashboard/mis-tareas")}
                className="px-2 pt-1 text-left text-caption text-(--primary-950) underline"
              >
                Ver todas mis tareas
              </button>
            </div>
          )}
        </div>

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
