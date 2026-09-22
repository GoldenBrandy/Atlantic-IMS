import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";
import { generateVerificationCode } from "../../utils/generateCode.js";
import {
  sendVerificationCodeEmail,
  sendAccessRequestEmail,
} from "../../utils/mailer.js";

// El código de verificación (pantalla "Ingresar con código de acceso") vale por 10 minutos, igual que los códigos de un solo use de Google.
const RESET_CODE_TIL_MINUTES = 10;
const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const authService = {
  async login({ userEmail, userPassword }) {
    if (!userEmail || !userPassword) {
      throw new Error("Correo y contrasena son obligatorios");
    }

    const user = await authRepository.findUserByEmail(userEmail);

    if (!user) {
      throw new Error("Credenciales invalidas");
    }

    const isMatch = await bcrypt.compare(userPassword, user.password);

    if (!isMatch) {
      throw new Error("Credenciales invalidas");
    }

    if (!user.is_active) {
      throw new Error("Usuario inactivo");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no esta configurado");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.user_email,
        isSuperUser: user.is_superuser === true,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email,
        isSuperUser: user.is_superuser ?? false,
        // El frontend redirige a "cambiar contraseña obligatorio" cuando esto es true (usuario creado por el admin, primer ingreso).
        mustChangePassword: user.must_change_password ?? false,
      },
    };
  },

  // Genera y "Envía" (simulado) un código de verificación de 8 dígitos para restablecer la contraseña olvidada.Nunca revela si el correo existe o no, para no facilitar enumeración de usuarios.
  async forgotPassword(userEmail) {
    if (!userEmail) {
      throw new Error("El correo es obligatorio");
    }

    const user = await authRepository.findUserByEmail(userEmail);

    if (user) {
      const code = generateVerificationCode();
      const expiresAt = new Date(
        Date.now() + RESET_CODE_TIL_MINUTES * 60 * 1000,
      );
      await authRepository.setResetCode(user.id, code, expiresAt);
      sendVerificationCodeEmail({
        to: user.user_email,
        name: user.user_name,
        code,
      }).catch((err) =>
        console.error("Error enviando código de verificación:", err),
      );
    }

    return {
      message: "Si el correo existe, se envió un código de verificación",
    };
  },

  // Verifica el codigo de 8 digitos (y su vencimiento) y define la nueva
  // contrasena. También limpia must_change_password, ya que restablecer la
  // contrasena cumple el mismo propósito que el cambio obligatorio.
  async resetPassword({ userEmail, code, newPassword }) {
    if (!userEmail || !code || !newPassword) {
      throw new Error("Correo, código y nueva contraseña son obligatorios");
    }

    if (!PASSWORD_COMPLEXITY_REGEX.test(newPassword)) {
      const error = new Error(
        "La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      );
      error.field = "newPassword";
      throw error;
    }

    const user = await authRepository.findUserByEmail(userEmail);

    const isCodeValid =
      user &&
      user.reset_code &&
      user.reset_code === code &&
      user.reset_code_expires_at &&
      new Date(user.reset_code_expires_at).getTime() >= Date.now();

    if (!isCodeValid) {
      const error = new Error("El código es inválido o ya venció");
      error.field = "code";
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.resetPassword(user.id, hashedPassword);

    return { message: "Contraseña restablecida correctamente" };
  },

  // Registra una solicitud de acceso y notifica (simulado) al correo de
  // soporte, ya que no existe auto-registro publico: el admin la revisa y
  // crea la cuenta manualmente.
  async requestAccess({ fullName, email, reason }) {
    if (!fullName || !email) {
      throw new Error("El nombre y el correo son obligatorios");
    }

    await authRepository.createAccessRequest({ fullName, email, reason });

    sendAccessRequestEmail({ to: process.env.SUPPORT_EMAIL, fullName, email, reason }).catch((err) =>
      console.error("Error enviando solicitud de acceso:", err),
    );

    return {
      message:
        "Tu solicitud fue enviada, espera la aprobación del administrador",
    };
  },
};
