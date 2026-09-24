import { API_URL as BASE_API_URL } from "@/features/config";

const SETTINGS_API_URL = `${BASE_API_URL}/settings`;

export async function getSupportEmail() {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${SETTINGS_API_URL}/support-email`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error obteniendo el correo de soporte");
  }

  const data = await response.json();
  return data.supportEmail;
}

export async function updateSupportEmail(supportEmail) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${SETTINGS_API_URL}/support-email`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ supportEmail }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Error al actualizar el correo de soporte");
  }

  const data = await response.json();
  return data.supportEmail;
}
