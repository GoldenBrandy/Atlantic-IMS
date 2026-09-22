// Genera un codigo numerico de 8 digitos para verificacion por correo
// (mismo largo que la pantalla "Ingresar con código de acceso" del diseño).
export function generateVerificationCode() {
    return String(Math.floor(Math.random() * 100000000)).padStart(8, "0");
}