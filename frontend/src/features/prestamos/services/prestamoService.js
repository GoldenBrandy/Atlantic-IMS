// const API_URL = "http://localhost:4000/api/prestamos";
import { API_URL as BASE_API_URL } from "@/features/config";

const API_URL = `${BASE_API_URL}/prestamos`;

export async function getPrestamos() {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error obteniendo los préstamos");
  return response.json();
}

export async function getPrestamoById(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

// Publicas (sin token): la persona llega desde el link del correo, puede no
// tener cuenta en el sistema (ej. solicitante externo).
export async function confirmPrestamoIdentity(id, role, code) {
  const response = await fetch(`${API_URL}/${id}/confirm-identity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, code }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "No se pudo confirmar la identidad");
    error.field = data.field;
    throw error;
  }
  return data;
}

export async function resendPrestamoIdentityCode(id, role) {
  const response = await fetch(`${API_URL}/${id}/resend-identity-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "No se pudo reenviar el código");
  }
  return data;
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