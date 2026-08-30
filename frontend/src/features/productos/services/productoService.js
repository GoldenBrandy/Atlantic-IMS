const API_URL = "http://localhost:4000/api/productos";

export async function getProductos() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error obteniendo los productos");
  return response.json();
}

export async function getProductoById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Producto no encontrado");
  }
  return response.json();
}

export async function createProducto(productoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al crear el producto");
  }

  return response.json();
}

export async function updateProducto(id, productoData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar el producto");
  }

  return response.json();
}

export async function setProductoActive(id, isActive) {
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
    throw new Error(error.error || "Error al actualizar el estado del producto");
  }

  return response.json();
}

export async function bulkDisableProductos(ids) {
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
    throw new Error(error.error || "Error al deshabilitar los productos");
  }

  return response.json();
}