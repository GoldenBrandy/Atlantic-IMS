// URL base del endpoint de autenticación en el backend.
// const API_URL = 'http://localhost:4000/api/auth';

import { API_URL } from "@/features/config";

const AUTH_API_URL = `${API_URL}/auth`;


//pide el codigo de verificación de 8 dígitos para restablecer la contraseña olvidada (el backend lo "envía" simulado, ver mailer.js).
export async function forgotPassword(userEmail) {
    const response = await fetch(`${AUTH_API_URL}/forgot-password`, {
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

//Verifica si el codigo de 8 digitos es correcto, sin cambiar la contraseña todavia (se usa antes de mostrar la pantalla para definir la nueva).
export async function verifyResetCode({ userEmail, code }) {
    const response = await fetch(`${AUTH_API_URL}/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, code }),
    });

    const data = await response.json();
    if (!response.ok) {
        const err = new Error(data.error || "El código no es válido");
        err.field = data.field;
        throw err;
    }
    return data;
}

//Verifica el código de 8 dígitos y define la nueva contraseña
export async function resetPassword({ userEmail, code, newPassword }) {
    const response = await fetch(`${AUTH_API_URL}/reset-password`, {
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
    const response = await fetch(`${AUTH_API_URL}/access-request`, {
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