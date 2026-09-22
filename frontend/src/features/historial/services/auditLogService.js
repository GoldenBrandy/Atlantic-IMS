// const API_URL = "http://localhost:4000/api/audit-logs";
import { API_URL as BASE_API_URL } from "@/features/config";

const API_URL = `${BASE_API_URL}/audit-logs`;

export async function getAuditLogs() {
  const token = sessionStorage.getItem("token");
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Error obteniendo el historial");
  }

  return response.json();
}