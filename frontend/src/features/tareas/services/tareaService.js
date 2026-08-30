const API_URL = "http://localhost:4000/api/tareas";

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
