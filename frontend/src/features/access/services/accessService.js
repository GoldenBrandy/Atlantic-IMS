const API_URL = "http://localhost:4000/api/access";

export async function hasPermission(permissionCode) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}/check/${permissionCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error verificando permisos");
  }

  return response.json();
}
