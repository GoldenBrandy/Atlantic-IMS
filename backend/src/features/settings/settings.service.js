import { settingsRepository } from "./settings.repository.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const settingsService = {
  async getSupportEmail() {
    return settingsRepository.getSupportEmail();
  },

  async updateSupportEmail(email) {
    if (!email || !EMAIL_REGEX.test(email)) {
      const error = new Error("El correo de soporte no es válido");
      error.statusCode = 400;
      throw error;
    }
    return settingsRepository.updateSupportEmail(email);
  },
};
