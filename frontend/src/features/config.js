// URL base de la API del backend.
// En desarrollo local apunta a http://localhost:4000/api.
// En producción (servidor), se define con la variable de entorno
// VITE_API_URL en el archivo .env del frontend antes de hacer el build.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
