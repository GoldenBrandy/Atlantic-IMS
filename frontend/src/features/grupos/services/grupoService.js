// El modulo "Grupos" ahora opera sobre la misma tabla de roles que ya usan
// "Tipo de Usuario" y "Gestion de Permisos" (antes era una tabla aparte con
// lider/integrantes). Se normaliza group_id -> id para que los consumidores
// existentes (ej. Prestamos, que ya esperaba { id, group_name }) no cambien.
const API_URL = "http://localhost:4000/api/groups";

function normalize(group) {
  return { ...group, id: group.group_id };
}

export async function getGrupos() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo los grupos");
  const data = await response.json();
  return data.map(normalize);
}

export async function getGrupoById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Grupo no encontrado");
  }
  const data = await response.json();
  return normalize(data);
}

export async function createGrupo(grupoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(grupoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear el grupo");
  }

  return response.json();
}

export async function updateGrupo(id, grupoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(grupoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar el grupo");
  }

  return response.json();
}

export async function bulkDisableGrupos(ids) {
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
    throw new Error(error.error || "Error al deshabilitar los grupos");
  }

  return response.json();
}

export async function setGrupoActive(id, isActive) {
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
    throw new Error(error.error || "Error al actualizar el estado del grupo");
  }

  return response.json();
}