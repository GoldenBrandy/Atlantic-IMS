import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository.js";

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
      { id: user.id, email: user.user_email, isSuperUser: user.is_superuser === true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.user_name,
        email: user.user_email,
        isSuperUser: user.is_superuser === true,
      },
    };
  },
};
