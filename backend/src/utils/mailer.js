// Envio de correo real via SMTP (Brevo). Si las variables de entorno SMTP_*
// no estan configuradas (ej. en un entorno sin credenciales todavia), el
// envio se simula y queda registrado en la consola, igual que antes.
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  : null;

async function sendEmail({ to, subject, text }) {
  if (!transporter) {
    console.log("\n================ CORREO SIMULADO (SMTP no configurado) ================");
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: ${text}`);
    console.log("=========================================================================\n");
    return { simulated: true };
  }

  await transporter.sendMail({ from: SMTP_FROM, to, subject, text });
  return { simulated: false };
}

export async function sendPasswordEmail({ to, name, password }) {
  return sendEmail({
    to,
    subject: `Bienvenido/a ${name} - Tu contraseña de acceso`,
    text:
      `Hola ${name}, se creó tu cuenta. Tu contraseña generada automáticamente es: ${password}\n` +
      "Te recomendamos cambiarla luego de tu primer inicio de sesión.",
  });
}

// Codigo de verificacion de 8 digitos para restablecer la contrasena
// olvidada (pantalla "Ingresar con código de acceso").
export async function sendVerificationCodeEmail({ to, name, code }) {
  return sendEmail({
    to,
    subject: "Tu código de verificación",
    text:
      `Hola ${name || ""}, tu código de verificación de 8 dígitos es: ${code}\n` +
      "Este código vence en 10 minutos.",
  });
}

// Notifica al correo de soporte que alguien pidio acceso al sistema (no hay
// auto-registro publico: el admin debe crear la cuenta manualmente).
export async function sendAccessRequestEmail({ to, fullName, email, reason }) {
  return sendEmail({
    to,
    subject: `Nueva solicitud de acceso - ${fullName}`,
    text:
      "Nueva solicitud de acceso al sistema:\n\n" +
      `Nombre: ${fullName}\n` +
      `Correo: ${email}\n` +
      `Motivo: ${reason || "No especificado"}`,
  });
}

// Recordatorio de fecha limite de una tarea (ademas de la notificacion
// in-app, ver notifications feature).
export async function sendTaskReminderEmail({ to, name, taskName, endDate }) {
  return sendEmail({
    to,
    subject: `Recordatorio: "${taskName}" vence pronto`,
    text: `Hola ${name || ""}, te recordamos que la tarea "${taskName}" vence el ${endDate}.`,
  });
}
