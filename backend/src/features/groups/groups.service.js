import { groupsRepository } from "./groups.repository.js";
import { slugifyGroupCode } from "../../utils/generateGroupCode.js";

// Genera un codigo unico a partir del nombre, agregando un numero al final
// si ya existe otro grupo con el mismo codigo base (ej. ADMIN, ADMIN2, ADMIN3).
async function generateUniqueCode(name) {
  const base = slugifyGroupCode(name) || "GRUPO";
  const existingCodes = new Set(await groupsRepository.findCodes());

  if (!existingCodes.has(base)) return base;

  let suffix = 2;
  while (existingCodes.has(`${base}${suffix}`)) suffix += 1;
  return `${base}${suffix}`;
}

export const groupsService = {
    async getAll() {
        return await groupsRepository.getAll();
    },

    async getById(groupId) {
        const group = await groupsRepository.getById(groupId);
        if (!group) throw new Error("Grupo no encontrado");
        return group;
    },

    async create(data) {
        if (!data.name) {
            const error = new Error("El nombre del grupo es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        const code = await generateUniqueCode(data.name);
        return groupsRepository.create({ name: data.name, code, description: data.description });
    },

    async update(groupId, data) {
        const existing = await groupsRepository.getById(groupId);
        if (!existing) throw new Error("Grupo no encontrado");

        // El codigo no se vuelve a generar al editar (solo cambia si el nombre
        // cambia y el codigo actual quedaria vacio, para no romper referencias).
        const code = existing.group_code || (await generateUniqueCode(data.name));
        const updated = await groupsRepository.update(groupId, {
            name: data.name,
            code,
            description: data.description,
        });
        if (!updated) throw new Error("Grupo no encontrado");
        return updated;
    },

    async bulkDisable(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            const error = new Error("Debe indicar al menos un id");
            error.statusCode = 400;
            throw error;
        }
        return groupsRepository.bulkDisable(ids);
    },

    async setActive(groupId, isActive) {
        const updated = await groupsRepository.setActive(groupId, isActive);
        if (!updated) throw new Error("Grupo no encontrado");
        return updated;
    },

    async getPermissionsByGroupId(groupId) {
        return await groupsRepository.getPermissionsByGroupId(groupId);
    },

    async updatePermissions(groupId, permissionCodenames) {
        const uniqueCodenames = [...new Set(permissionCodenames)];
        return await groupsRepository.updatePermissions(groupId, uniqueCodenames);
    }
};
