const API_URL = "http://localhost:4000/api/devoluciones";

export async function getDevoluciones() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo las devoluciones");
  return response.json();
}

export async function getDevolucionByPrestamoId(prestamoId) {
  const response = await fetch(`${API_URL}/${prestamoId}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Devolución no encontrada");
  }
  return response.json();
}

export async function createDevolucion(prestamoId, devolucionData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${prestamoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(devolucionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al registrar la devolución");
  }

  return response.json();
}