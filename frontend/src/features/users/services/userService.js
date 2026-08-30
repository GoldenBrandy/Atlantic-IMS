const API_URL = "http://localhost:4000/api/users";

// Arma un nombre visible a partir de los campos reales del usuario
// (algunos, como last_name_1, pueden venir vacios).
export function formatUserName(user) {
  return [user.user_name, user.last_name_1].filter(Boolean).join(" ");
}

export async function getUsers() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error obteniendo los usuarios");
  }

  return await response.json();
}

export async function createUser(userData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.error || "Error al crear el usuario");
    err.field = error.field;
    throw err;
  }

  return await response.json();
}

export async function getUserById(userId) {
  const response = await fetch(`${API_URL}/${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al obtener el usuario");
  }

  return await response.json();
}

export async function updateUser(userId, userData) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${userId}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.error || "Error al actualizar el usuario");
    err.field = error.field;
    throw err;
  }

  return await response.json();
}

// Deshabilita varios usuarios a la vez (solo super administrador).
export async function bulkDisableUsers(ids) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/bulk-disable`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al deshabilitar los usuarios");
  }

  return response.json();
}

// Activa/desactiva un unico usuario (switch individual en la tabla).
export async function setUserActive(userId, isActive) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${userId}/status`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar el estado del usuario");
  }

  return response.json();
}

// Cambia la contrasena del usuario autenticado (solo la propia cuenta).
export async function changePassword(userId, { currentPassword, newPassword }) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${userId}/password`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.error || "Error al cambiar la contraseña");
    err.field = error.field;
    throw err;
  }

  return await response.json();
}