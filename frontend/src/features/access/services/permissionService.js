const GROUPS_API_URL = "http://localhost:4000/api/groups";
const USERS_API_URL = "http://localhost:4000/api/users";
const PERMISSIONS_API_URL = "http://localhost:4000/api/permissions";

export async function getGroupPermissions(groupId) {
  const response = await fetch(`${GROUPS_API_URL}/${groupId}/permissions`);

  if (!response.ok) {
    throw new Error("Error obteniendo los permisos del grupo");
  }

  return response.json();
}

export async function getAllPermissions() {
  const response = await fetch(PERMISSIONS_API_URL);

  if (!response.ok) {
    throw new Error("Error obteniendo los permisos");
  }

  return response.json();
}

// Permisos individuales de un usuario (independientes de su grupo/tipo de usuario).
export async function getUserPermissions(userId) {
  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`);

  if (!response.ok) {
    throw new Error("Error obteniendo los permisos del usuario");
  }

  return response.json();
}

export async function updateUserPermissions(userId, permissionCodenames) {
  const response = await fetch(`${USERS_API_URL}/${userId}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions: permissionCodenames }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Error al actualizar los permisos del usuario");
  }

  return response.json();
}
