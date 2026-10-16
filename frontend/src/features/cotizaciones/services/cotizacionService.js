import { API_URL as BASE_API_URL } from "@/features/config";

const API_URL = `${BASE_API_URL}/cotizaciones`;

export async function getCotizaciones() {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error obteniendo las cotizaciones");
  return response.json();
}

export async function getCotizacionById(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Cotización no encontrada");
  }
  return response.json();
}

export async function createCotizacion(cotizacionData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cotizacionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear la cotización");
  }

  return response.json();
}

export async function updateCotizacion(id, cotizacionData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cotizacionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar la cotización");
  }

  return response.json();
}

export async function setCotizacionActive(id, isActive) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar el estado de la cotización");
  }

  return response.json();
}

export async function bulkDisableCotizaciones(ids) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/bulk-disable`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al deshabilitar las cotizaciones");
  }

  return response.json();
}
