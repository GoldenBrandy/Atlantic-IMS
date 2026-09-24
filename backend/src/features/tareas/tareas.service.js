import { tareaRepository } from "./tareas.repository.js";
import { notificationRepository } from "../notifications/notifications.repository.js";
import { sendTaskReminderEmail } from "../../utils/mailer.js";

// Se avisa cuando falten 2 dias o menos para la fecha limite (recordatorio).
const REMINDER_DAYS_AHEAD = 2;

function mapPayload(data) {
  return {
    taskName: data.taskName,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    assignedUsers: data.assignedUsers ?? [],
    assignedUserTypes: data.assignedUserTypes ?? [],
    userEndDates: data.userEndDates ?? {},
  };
}

export const tareaService = {
  async getAllTareas() {
    // Se aprovecha cada listado para generar recordatorios pendientes (no
    // hay tarea programada/cron en este proyecto).
    this.checkReminders().catch((err) => console.error("Error generando recordatorios:", err));
    return tareaRepository.findAll();
  },

  async getTareaById(id) {
    const tarea = await tareaRepository.findById(id);
    if (!tarea) throw new Error("Tarea no encontrada");
    return tarea;
  },

  // actorId: quien crea la tarea, queda registrado como el "remitente"/asignador.
  async createTarea(data, actorId) {
    return tareaRepository.create({ ...mapPayload(data), assignedBy: actorId || null });
  },

  async updateTarea(id, data) {
    const updated = await tareaRepository.update(id, mapPayload(data));
    if (!updated) throw new Error("Tarea no encontrada");
    return updated;
  },

  // El asignado abre la tarea: se le avisa al remitente (si no es la misma
  // persona), una vez por dia como maximo para no saturar de avisos.
  async registerView(tareaId, viewerId) {
    const tarea = await tareaRepository.findById(tareaId);
    if (!tarea) throw new Error("Tarea no encontrada");

    const isAssignee = (tarea.assigned_users ?? []).some((id) => String(id) === String(viewerId));
    if (!isAssignee || !tarea.assigned_by || String(tarea.assigned_by) === String(viewerId)) {
      return { notified: false };
    }

    const alreadyNotifiedToday = await notificationRepository.existsToday({
      userId: tarea.assigned_by,
      tareaId,
      type: "task_viewed",
    });
    if (alreadyNotifiedToday) return { notified: false };

    await notificationRepository.create({
      userId: tarea.assigned_by,
      type: "task_viewed",
      message: `Tu tarea "${tarea.task_name}" fue vista por un asignado`,
      tareaId,
    });
    return { notified: true };
  },

  // Un asignado marca su propia tarea como completada. Notifica a quien la
  // asigno para que la verifique (no la marca como verificada: eso lo sigue
  // haciendo el asignador por separado con verifyTarea).
  async markComplete(tareaId, actorId) {
    const tarea = await tareaRepository.findById(tareaId);
    if (!tarea) throw new Error("Tarea no encontrada");

    const isAssignee = (tarea.assigned_users ?? []).some((id) => String(id) === String(actorId));
    if (!isAssignee) {
      const error = new Error("Solo un asignado puede marcar esta tarea como completada");
      error.statusCode = 403;
      throw error;
    }
    if (tarea.status === "cancelada") {
      const error = new Error("No se puede completar una tarea cancelada");
      error.statusCode = 400;
      throw error;
    }

    const updated = await tareaRepository.markComplete(tareaId);

    if (tarea.assigned_by && String(tarea.assigned_by) !== String(actorId)) {
      await notificationRepository.create({
        userId: tarea.assigned_by,
        type: "task_completed",
        message: `La tarea "${tarea.task_name}" fue marcada como completada`,
        tareaId,
      });
    }

    return updated;
  },

  // El asignador verifica una tarea que ya esta "completada". Notifica a
  // cada asignado.
  async verifyTarea(tareaId, actorId) {
    const tarea = await tareaRepository.findById(tareaId);
    if (!tarea) throw new Error("Tarea no encontrada");

    if (!tarea.assigned_by || String(tarea.assigned_by) !== String(actorId)) {
      const error = new Error("Solo quien asignó la tarea puede verificarla");
      error.statusCode = 403;
      throw error;
    }
    if (tarea.status !== "completada") {
      const error = new Error("Solo se puede verificar una tarea completada");
      error.statusCode = 400;
      throw error;
    }

    const verified = await tareaRepository.verify(tareaId);

    await Promise.all(
      (tarea.assigned_users ?? []).map((userId) =>
        notificationRepository.create({
          userId,
          type: "task_verified",
          message: `Tu tarea "${tarea.task_name}" fue verificada por quien te la asignó`,
          tareaId,
        }),
      ),
    );

    return verified;
  },

  // Genera (in-app + correo simulado) los recordatorios de tareas cuya
  // fecha limite esta cerca, evitando duplicar el mismo dia.
  async checkReminders() {
    const upcoming = await tareaRepository.findUpcomingAssignments(REMINDER_DAYS_AHEAD);

    for (const row of upcoming) {
      const alreadySentToday = await notificationRepository.existsToday({
        userId: row.user_id,
        tareaId: row.tarea_id,
        type: "task_reminder",
      });
      if (alreadySentToday) continue;

      // pg puede devolver la fecha como Date o como string segun el driver;
      // normalizamos siempre a YYYY-MM-DD.
      const endDate =
        row.effective_end_date instanceof Date
          ? row.effective_end_date.toISOString().slice(0, 10)
          : String(row.effective_end_date).slice(0, 10);

      await notificationRepository.create({
        userId: row.user_id,
        type: "task_reminder",
        message: `La tarea "${row.task_name}" vence el ${endDate}`,
        tareaId: row.tarea_id,
      });

      sendTaskReminderEmail({
        to: row.user_email,
        name: row.user_name,
        taskName: row.task_name,
        endDate,
      }).catch((err) => console.error("Error enviando recordatorio de tarea:", err));
    }
  },
};
