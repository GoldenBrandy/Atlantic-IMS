const API_URL = "http://localhost:4000/api/notifications";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function getNotifications() {
  const response = await fetch(API_URL, { headers: authHeaders() });
  if (!response.ok) throw new Error("Error obteniendo las notificaciones");
  return response.json();
}

export async function markNotificationAsRead(id) {
  const response = await fetch(`${API_URL}/${id}/read`, { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error("Error al marcar la notificación como leída");
  return response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${API_URL}/read-all`, { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error("Error al marcar las notificaciones como leídas");
  return response.json();
}
