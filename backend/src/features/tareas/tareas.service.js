import { tareaRepository } from "./tareas.repository.js";

function mapPayload(data) {
  return {
    taskName: data.taskName,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    assignedUsers: data.assignedUsers ?? [],
    assignedUserTypes: data.assignedUserTypes ?? [],
    userEndDates: data.userEndDates ?? {},
  };
}

export const tareaService = {
  async getAllTareas() {
    return tareaRepository.findAll();
  },

  async getTareaById(id) {
    const tarea = await tareaRepository.findById(id);
    if (!tarea) throw new Error("Tarea no encontrada");
    return tarea;
  },

  async createTarea(data) {
    return tareaRepository.create(mapPayload(data));
  },

  async updateTarea(id, data) {
    const updated = await tareaRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Tarea no encontrada");
    return updated;
  },
};
