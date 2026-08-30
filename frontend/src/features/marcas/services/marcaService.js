const API_URL = "http://localhost:4000/api/marcas";

export async function getMarcas() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo las marcas");
  return response.json();
}

export async function getMarcaById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Marca no encontrada");
  }
  return response.json();
}

export async function createMarca(marcaData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(marcaData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear la marca");
  }

  return response.json();
}

export async function updateMarca(id, marcaData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(marcaData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar la marca");
  }

  return response.json();
}

export async function setMarcaActive(id, isActive) {
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
    throw new Error(error.error || "Error al actualizar el estado de la marca");
  }

  return response.json();
}

export async function bulkDisableMarcas(ids) {
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
    throw new Error(error.error || "Error al deshabilitar las marcas");
  }

  return response.json();
}