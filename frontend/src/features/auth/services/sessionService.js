// Lee la sesion guardada en el login (sessionStorage) para saber quien esta
// autenticado y si tiene privilegios de super administrador.
export function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function getToken() {
  return sessionStorage.getItem("token");
}

export function isSuperUser() {
  return getCurrentUser()?.isSuperUser === true;
}

// El admin registro a este usuario con una contraseña automática: debe cambiarla antes de poder usar el resto del sistema
export function mustChangePassword() {
  return getCurrentUser()?.mustChangePassword === true;
}