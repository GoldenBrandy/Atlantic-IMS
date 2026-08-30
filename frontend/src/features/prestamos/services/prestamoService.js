const API_URL = "http://localhost:4000/api/prestamos";

export async function getPrestamos() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo los préstamos");
  return response.json();
}

export async function getPrestamoById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Préstamo no encontrado");
  }
  return response.json();
}

export async function createPrestamo(prestamoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prestamoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear el préstamo");
  }

  return response.json();
}

export async function updatePrestamo(id, prestamoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prestamoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar el préstamo");
  }

  return response.json();
}

export async function returnPrestamo(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/return`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al registrar la devolución");
  }

  return response.json();
}