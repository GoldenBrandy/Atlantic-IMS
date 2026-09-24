// const API_URL = "http://localhost:4000/api/tareas";
import { API_URL as BASE_API_URL } from "@/features/config";

const API_URL = `${BASE_API_URL}/tareas`;


export async function getTareas() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo las tareas");
  return response.json();
}

export async function getTareaById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Tarea no encontrada");
  }
  return response.json();
}

export async function createTarea(tareaData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tareaData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear la tarea");
  }

  return response.json();
}

export async function updateTarea(id, tareaData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tareaData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar la tarea");
  }

  return response.json();
}

// El asignado abre la tarea: notifica (in-app) a quien la asigno.
export async function viewTarea(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/view`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error al registrar la vista de la tarea");
  return response.json();
}

// El asignado marca su propia tarea como completada.
export async function markTareaComplete(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Error al marcar la tarea como completada");
  }
  return response.json();
}

// El asignador verifica una tarea "completada".
export async function verifyTarea(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/verify`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al verificar la tarea");
  }
  return response.json();
}
