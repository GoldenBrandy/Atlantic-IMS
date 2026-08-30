// Importamos el repositorio de usuarios.
// El service depende del repository para acceder a la persistencia,
// pero el repository NO debe conocer el service.
import { userRepository } from "./user.repository.js";
import bcrypt from "bcrypt";
import { generatePassword } from "../../utils/generatePassword.js";
import { sendPasswordEmail } from "../../utils/mailer.js";


// Convierte el id de grupo recibido del frontend (string o numero) a un entero o null.
function toGroupId(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}


// Traduce una violacion de llave unica de PostgreSQL (correo, telefono o
// documento repetido) a un error legible, indicando a que campo del
// formulario pertenece para que el frontend lo pueda marcar.
const UNIQUE_VIOLATION_FIELDS = {
  users_user_email_key: {
    field: "userEmail",
    message: "Ya existe un usuario registrado con este correo electrónico",
  },
  users_document_number_key: {
    field: "userDocumentNumber",
    message: "Ya existe un usuario registrado con este número de documento",
  },
};

// El telefono no tiene un constraint unico en la base de datos (ya existian
// duplicados antes de esta validacion), asi que se verifica manualmente.
async function assertPhoneNotTaken(phone, excludeId) {
  if (!phone) return;

  const existing = await userRepository.findByPhone(phone, excludeId);
  if (existing) {
    const error = new Error("Ya existe un usuario registrado con este número de teléfono");
    error.field = "userPhone";
    error.statusCode = 409;
    throw error;
  }
}

function toFriendlyError(error) {
  if (error.code === "23505" && UNIQUE_VIOLATION_FIELDS[error.constraint]) {
    const { field, message } = UNIQUE_VIOLATION_FIELDS[error.constraint];
    const friendlyError = new Error(message);
    friendlyError.field = field;
    friendlyError.statusCode = 409;
    return friendlyError;
  }

  return error;
}


// Exportamos el servicio de usuarios.
// El service representa la capa de lógica de negocio de la aplicación.
export const userService = {


  // Método encargado de crear un usuario
  // Recibe datos provenientes del controller,
  // idealmente ya validados a nivel estructural (DTO / schema)
  async createUser(data) {
    await assertPhoneNotTaken(data.phone);

    // Si no se envio contrasena, se genera una automaticamente y se "envia"
    // (por ahora solo queda registrada en la consola del backend) al correo del usuario.
    let plainPassword = data.userPassword ?? data.password;
    let generatedPassword = null;

    if (!plainPassword) {
      generatedPassword = generatePassword();
      plainPassword = generatedPassword;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Traduce el payload que envia el formulario de registro (firstName, group, status, ...)
    // al contrato que espera el repository (name, groupId, isActive, ...).
    const userData = {
      name: data.name ?? data.firstName,
      lastName1: data.lastName1,
      userEmail: data.userEmail,
      institutionalEmail: data.institutionalEmail,
      phone: data.phone,
      secondaryPhone: data.secondaryPhone ?? null,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      groupId: toGroupId(data.group ?? data.groupId),
      address: data.address,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      userPassword: hashedPassword,
      avatarUrl: data.avatarUrl ?? null,
      isStaff: data.isStaff ?? false,
      // Un usuario nuevo siempre queda activo; desactivarlo se hace despues
      // desde la tabla (switch individual o deshabilitado masivo).
      isActive: true,
      isSuperUser: data.isSuperUser ?? false,
      isCustodian: data.isCustodian ?? false,
    };

    let created;
    try {
      created = await userRepository.create(userData);
    } catch (error) {
      throw toFriendlyError(error);
    }

    if (generatedPassword) {
      sendPasswordEmail({
        to: userData.userEmail,
        name: userData.name,
        password: generatedPassword,
      }).catch((err) => console.error("Error enviando correo de bienvenida:", err));
    }

    return created;
  },


  // Lista todos los usuarios (para selects de responsable, lider, integrantes, etc.).
  async getAllUsers() {
    return userRepository.findAll();
  },


  // Busca un usuario existente para precargar el formulario de edicion.
  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  },


  // Actualiza un usuario existente.
  // La contrasena solo se rehashea y se guarda si el usuario escribio una nueva.
  async updateUser(id, data) {
    await assertPhoneNotTaken(data.phone, id);

    const userData = {
      name: data.name ?? data.firstName,
      lastName1: data.lastName1,
      userEmail: data.userEmail,
      institutionalEmail: data.institutionalEmail,
      phone: data.phone,
      secondaryPhone: data.secondaryPhone ?? null,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      groupId: toGroupId(data.group ?? data.groupId),
      address: data.address,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      avatarUrl: data.avatarUrl ?? null,
      isStaff: data.isStaff ?? false,
      isCustodian: data.isCustodian ?? false,
    };

    const plainPassword = data.userPassword ?? data.password;
    if (plainPassword) {
      userData.userPassword = await bcrypt.hash(plainPassword, 10);
    }

    let updated;
    try {
      updated = await userRepository.update(id, userData);
    } catch (error) {
      throw toFriendlyError(error);
    }

    if (!updated) {
      throw new Error("Usuario no encontrado");
    }

    return updated;
  },


  // Deshabilita varios usuarios a la vez (is_active = false).
  async bulkDisable(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      const error = new Error("Debe indicar al menos un id");
      error.statusCode = 400;
      throw error;
    }
    return userRepository.bulkDisable(ids);
  },


  // Activa/desactiva un unico usuario.
  async setActive(id, isActive) {
    const updated = await userRepository.setActive(id, isActive);
    if (!updated) throw new Error("Usuario no encontrado");
    return updated;
  },


  // Cambia la contrasena del propio usuario. Exige la contrasena actual
  // y la misma regla de complejidad usada para las contrasenas generadas.
  async changePassword(id, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const error = new Error("Debe indicar la contraseña actual y la nueva contraseña");
      error.statusCode = 400;
      throw error;
    }

    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!complexityRegex.test(newPassword)) {
      const error = new Error(
        "La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial",
      );
      error.field = "newPassword";
      error.statusCode = 400;
      throw error;
    }

    const existing = await userRepository.findPasswordHashById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, existing.password);
    if (!isMatch) {
      const error = new Error("La contraseña actual no es correcta");
      error.field = "currentPassword";
      error.statusCode = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await userRepository.updatePassword(id, hashedPassword);

    if (!updated) {
      throw new Error("Usuario no encontrado");
    }

    return updated;
  },


  // Permisos individuales del usuario (independientes de su grupo).
  async getPermissionsByUserId(userId) {
    return userRepository.getPermissionsByUserId(userId);
  },

  async updateUserPermissions(userId, permissionCodenames) {
    const uniqueCodenames = [...new Set(permissionCodenames)];
    return userRepository.updatePermissions(userId, uniqueCodenames);
  },
};
