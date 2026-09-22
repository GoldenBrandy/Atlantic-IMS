// const API_URL = "http://localhost:4000/api/access";
import { API_URL } from "@/features/config";

const ACCESS_API_URL = `${API_URL}/access`;


export async function hasPermission(permissionCode) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${ACCESS_API_URL}/check/${permissionCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error verificando permisos");
  }

  return response.json();
}
