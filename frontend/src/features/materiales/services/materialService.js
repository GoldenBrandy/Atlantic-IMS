const API_URL = "http://localhost:4000/api/materiales";

export async function getMateriales() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo los materiales");
  return response.json();
}

export async function getMaterialById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Material no encontrado");
  }
  return response.json();
}

export async function createMaterial(materialData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(materialData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear material");
  }

  return response.json();
}

export async function updateMaterial(id, materialData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(materialData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar material");
  }

  return response.json();
}

export async function setMaterialActive(id, isActive) {
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
    throw new Error(error.error || "Error al actualizar el estado del material");
  }

  return response.json();
}

export async function bulkDisableMateriales(ids) {
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
    throw new Error(error.error || "Error al deshabilitar los materiales");
  }

  return response.json();
}