// URL base del endpoint de autenticación en el backend.
const API_URL = 'http://localhost:4000/api/auth';

//pide el codigo de verificación de 8 dígitos para restablecer la contraseña olvidada (el backend lo "envía" simulado, ver mailer.js).
export async function forgotPassword(userEmail) {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ userEmail }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el código de verificación");
    }
    return data;
}

//Verifica el código de 8 dígitos y define la nueva contraseña
export async function resetPassword({ userEmail, code, newPassword }) {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, code, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || "No se pudo restablecer la contraseña");
        err.field = data.field;
        throw err;
    }
    return data;
}

// Solicita acceso al sistema (no hay auto-registro publico): el admin recibe la notificación y crea la cuenta manualmente si corresponde.
export async function requestAccess({ fullName, email, reason }) {
    const response = await fetch(`${API_URL}/access-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, reason }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error|| "No se pudo enviar la solicitud");
    }
    return data;
}