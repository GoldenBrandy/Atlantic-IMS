import { prestamoRepository } from "./prestamos.repository.js";
import { generateVerificationCode } from "../../utils/generateCode.js";
import { sendIdentityConfirmationCodeEmail } from "../../utils/mailer.js";

const IDENTITY_CODE_TTL_MINUTES = 60;

function toId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

// Genera y manda el codigo de confirmacion de identidad para un rol. Si no
// hay correo a quien mandarlo (ej. no se asigno prestador), no hace nada.
async function sendIdentityCode(prestamoId, role, email, name) {
  if (!email) return false;
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + IDENTITY_CODE_TTL_MINUTES * 60 * 1000);

  if (role === "requester") {
    await prestamoRepository.setRequesterOtp(prestamoId, code, expiresAt);
  } else {
    await prestamoRepository.setLenderOtp(prestamoId, code, expiresAt);
  }

  await sendIdentityConfirmationCodeEmail({ to: email, name, code, prestamoId, role });
  return true;
}

function mapPayload(data) {
  const materialIds = Array.isArray(data.materialIds) ? data.materialIds : [];
  return {
    materialIds: materialIds.map(toId).filter((id) => id !== null),
    requestingUser: toId(data.requestingUser),
    lendingUser: toId(data.lendingUser),
    ficha: data.ficha || null,
    requesterEmail: data.requesterEmail || null,
    justification: data.justification,
    loanType: data.loanType,
    startDate: data.startDate,
    dueDate: data.dueDate,
    signatureUrl: data.signatureUrl ?? null,
  };
}

export const prestamoService = {
  async getAllPrestamos() {
    return prestamoRepository.findAll();
  },

  async getPrestamoById(id) {
    const prestamo = await prestamoRepository.findById(id);
    if (!prestamo) throw new Error("Préstamo no encontrado");
    return prestamo;
  },

  async createPrestamo(data) {
    // La firma ya no es obligatoria al crear: la persona puede firmar despues
    // editando el prestamo desde su propia cuenta, sin tener que estar
    // presente en el momento de la creacion.
    if (!Array.isArray(data.materialIds) || data.materialIds.length === 0) {
      const error = new Error("Debe seleccionar al menos un ítem a prestar");
      error.statusCode = 400;
      error.field = "materialIds";
      throw error;
    }
    if (!data.requestingUser && !data.requesterEmail) {
      const error = new Error("Debe seleccionar un usuario solicitante registrado o indicar su correo electrónico");
      error.statusCode = 400;
      error.field = "requesterEmail";
      throw error;
    }
    // Los items deben existir y estar disponibles (activos y con existencias).
    const ids = [...new Set(data.materialIds.map(toId).filter((id) => id !== null))];
    const found = await prestamoRepository.findMaterialsByIds(ids);
    if (found.length !== ids.length) {
      const error = new Error("Uno o mas items seleccionados no existen");
      error.statusCode = 400;
      error.field = "materialIds";
      throw error;
    }
    const unavailable = found.find((m) => !m.is_active || Number(m.quantity) <= 0);
    if (unavailable) {
      const error = new Error(
        `El item "${unavailable.name}" no esta disponible (deshabilitado o sin existencias)`,
      );
      error.statusCode = 409;
      error.field = "materialIds";
      throw error;
    }

    const created = await prestamoRepository.create(mapPayload(data));

    // El prestamo queda "pendiente de confirmacion" hasta que el solicitante
    // y el prestador confirmen su identidad desde el correo que reciben.
    const requesterContact = data.requestingUser
      ? await prestamoRepository.getUserContact(toId(data.requestingUser))
      : { user_email: data.requesterEmail || null, user_name: null };
    await sendIdentityCode(created.id, "requester", requesterContact?.user_email, requesterContact?.user_name);

    const lendingUserId = toId(data.lendingUser);
    if (lendingUserId) {
      const lenderContact = await prestamoRepository.getUserContact(lendingUserId);
      await sendIdentityCode(created.id, "lender", lenderContact?.user_email, lenderContact?.user_name);
    } else {
      // No se asigno un prestador todavia: no hay nadie a quien confirmarle,
      // asi que ese lado no bloquea el paso a "activo".
      await prestamoRepository.confirmLenderIdentity(created.id);
    }

    return created;
  },

  async updatePrestamo(id, data) {
    const updated = await prestamoRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Préstamo no encontrado");
    return updated;
  },

  async returnPrestamo(id) {
    const updated = await prestamoRepository.markReturned(id);
    if (!updated) throw new Error("Préstamo no encontrado");
    return updated;
  },

  // Confirmacion publica de identidad (sin sesion): la persona llega desde
  // el link del correo y escribe el codigo de 8 digitos.
  async confirmIdentity(id, role, code) {
    if (role !== "requester" && role !== "lender") {
      const error = new Error("Rol inválido");
      error.statusCode = 400;
      throw error;
    }

    const state = await prestamoRepository.getIdentityState(id);
    if (!state) {
      const error = new Error("Préstamo no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const isRequester = role === "requester";
    const alreadyConfirmed = isRequester ? state.requester_identity_confirmed : state.lender_identity_confirmed;
    if (alreadyConfirmed) {
      return {
        bothConfirmed: isRequester ? state.lender_identity_confirmed : state.requester_identity_confirmed,
      };
    }

    const storedCode = isRequester ? state.requester_otp_code : state.lender_otp_code;
    const expiresAt = isRequester ? state.requester_otp_expires_at : state.lender_otp_expires_at;

    if (!storedCode || !code || storedCode !== code) {
      const error = new Error("El código ingresado no es correcto");
      error.statusCode = 400;
      error.field = "code";
      throw error;
    }
    if (!expiresAt || new Date(expiresAt) < new Date()) {
      const error = new Error("El código venció, pide uno nuevo");
      error.statusCode = 400;
      error.field = "code";
      throw error;
    }

    if (isRequester) {
      await prestamoRepository.confirmRequesterIdentity(id);
    } else {
      await prestamoRepository.confirmLenderIdentity(id);
    }

    return {
      bothConfirmed: isRequester ? state.lender_identity_confirmed : state.requester_identity_confirmed,
    };
  },

  async resendIdentityCode(id, role) {
    if (role !== "requester" && role !== "lender") {
      const error = new Error("Rol inválido");
      error.statusCode = 400;
      throw error;
    }

    const prestamo = await prestamoRepository.findById(id);
    if (!prestamo) {
      const error = new Error("Préstamo no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const contact =
      role === "lender"
        ? await prestamoRepository.getUserContact(prestamo.lending_user)
        : prestamo.requesting_user
          ? await prestamoRepository.getUserContact(prestamo.requesting_user)
          : { user_email: prestamo.requester_email, user_name: null };

    if (!contact?.user_email) {
      const error = new Error("No hay un correo registrado para confirmar este rol");
      error.statusCode = 400;
      throw error;
    }

    await sendIdentityCode(id, role, contact.user_email, contact.user_name);
    return { sent: true };
  },
};
