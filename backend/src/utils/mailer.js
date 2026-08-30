// Envio de correo. Todavia no hay un proveedor SMTP configurado, asi que por
// ahora el "envio" solo se registra en la consola del backend con el contenido
// completo del correo. Para activar el envio real:
//   1. npm install nodemailer
//   2. Agregar SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD al .env
//   3. Reemplazar el cuerpo de sendPasswordEmail por una llamada real a nodemailer.

export async function sendPasswordEmail({ to, name, password }) {
  console.log("\n================ CORREO SIMULADO (no enviado) ================");
  console.log(`Para: ${to}`);
  console.log(`Asunto: Bienvenido/a ${name} - Tu contraseña de acceso`);
  console.log(
    `Cuerpo: Hola ${name}, se creó tu cuenta. Tu contraseña generada automáticamente es: ${password}\n` +
      "Te recomendamos cambiarla luego de tu primer inicio de sesión.",
  );
  console.log("=================================================================\n");

  return { simulated: true };
}
