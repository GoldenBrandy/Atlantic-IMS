import { tareaService } from "./tareas.service.js";

export const tareaController = {
  async getAll(req, res) {
    try {
      const tareas = await tareaService.getAllTareas();
      res.status(200).json(tareas);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const tarea = await tareaService.getTareaById(req.params.id);
      res.status(200).json(tarea);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const tarea = await tareaService.createTarea(req.body, req.user?.id);
      res.status(201).json({
        message: "Tarea creada correctamente",
        tareaId: tarea.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const tarea = await tareaService.updateTarea(req.params.id, req.body);
      res.status(200).json({
        message: "Tarea actualizada correctamente",
        tareaId: tarea.id,
      });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // El asignado abre la tarea: se notifica (in-app) a quien la asigno.
  async registerView(req, res) {
    try {
      const result = await tareaService.registerView(req.params.id, req.user.id);
      res.status(200).json(result);
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(400).json({ error: err.message });
    }
  },

  // El asignador verifica una tarea "completada".
  async verify(req, res) {
    try {
      const result = await tareaService.verifyTarea(req.params.id, req.user.id);
      res.status(200).json({ message: "Tarea verificada correctamente", verifiedAt: result.verified_at });
    } catch (err) {
      console.error("ERROR BACKEND:", err);
      res.status(err.statusCode ?? 400).json({ error: err.message });
    }
  },
};
