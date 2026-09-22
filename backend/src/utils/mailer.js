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

// Codigo de verificacion de 8 digitos para restablecer la contrasena
// olvidada (pantalla "Ingresar con código de acceso").
export async function sendVerificationCodeEmail({ to, name, code }) {
  console.log("\n============= CORREO SIMULADO (no enviado) ===============");
  console.log(`Para: ${to}`);
  console.log("Asunto: Tu código de verificación");
  console.log(`Cuerpo: Hola ${name || ""}, tu código de verificación de 8 dígitos es: ${code}\n` + 
    "Este código vence en 10 minutos.",
  );
  console.log
  ("=================================================================\n");

  return { simulated: true };
}

// Notifica al correo de soporte que alguien pidio acceso al sistema (no hay
// auto-registro publico: el admin debe crear la cuenta manualmente).
export async function sendAccessRequestEmail({ to, fullName, email, reason }) {
  console.log("\n================ CORREO SIMULADO (no enviado) ================");
  console.log(`Para: ${to}`);
  console.log("Asunto: Nueva solicitud de acceso");
  console.log(
    `Cuerpo: ${fullName} (${email}) solicitó acceso al sistema.\n` +
      `Motivo: ${reason || "No especificado"}`,
  );
  console.log("=================================================================\n");

  return { simulated: true };
}

// Recordatorio de fecha limite de una tarea (ademas de la notificacion
// in-app, ver notifications feature).
export async function sendTaskReminderEmail({ to, name, taskName, endDate }) {
  console.log("\n============ CORREO SIMULADO (no enviado) =================");
  console.log(`Para: ${to}`);
  console.log(`Asunto: Recordatorio: "${taskName}" vence pronto`);
  console.log
  (`Cuerpo: Hola ${name || ""}, te recordamos que la tarea "${taskName}" vence el ${endDate}.`,
  );
  console.log
  ("===================================================================\n");

  return { simulated: true };
}