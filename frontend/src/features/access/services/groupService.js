const API_URL = "http://localhost:4000/api/groups";

export async function getGroups() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error obteniendo los grupos");
  }

  return response.json();
}

export async function updateGroupPermissions(groupId, permissionCodenames) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/${groupId}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      permissions: permissionCodenames,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.message || "Error actualizando los permisos del grupo",
    );
  }

  return response.json();
}
