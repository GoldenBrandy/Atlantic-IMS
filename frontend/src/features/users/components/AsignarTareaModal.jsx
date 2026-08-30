import { useState } from "react";
import { z } from "zod";
import { X, Check, ClipboardList, CalendarDays, CalendarCheck, FileText, UserCog } from "lucide-react";
import { Input, Button, Select, MultiSelectField } from "@/shared";
import { TASK_STATUS_OPTIONS, USER_TYPE_OPTIONS } from "@/features/tareas/services/tareaOptionsService";

const pendingTaskSchema = z
  .object({
    taskName: z
      .string()
      .min(1, "El nombre de la tarea es obligatorio")
      .max(100, "El nombre es demasiado largo"),
    status: z.string().min(1, "Debe seleccionar un estado"),
    startDate: z.string().min(1, "Debe indicar la fecha de inicio"),
    endDate: z.string().min(1, "Debe indicar la fecha de fin"),
    description: z
      .string()
      .min(5, "La descripción debe tener al menos 5 caracteres")
      .max(500, "La descripción es demasiado larga"),
    assignedUserTypes: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un tipo de usuario"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La fecha fin no puede ser anterior a la fecha de inicio",
    path: ["endDate"],
  });

const emptyTask = {
  taskName: "",
  status: "",
  startDate: "",
  endDate: "",
  description: "",
  assignedUserTypes: [],
};

// Modal para armar los datos de una tarea que se asignará al nuevo usuario
// justo después de crearlo (todavía no existe un id real al abrir el modal).
// El padre solo monta este componente mientras el modal está abierto, así
// el estado se reinicia (o se precarga con initialData) en cada apertura.
export default function AsignarTareaModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData ?? emptyTask);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUserType = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      assignedUserTypes: prev.assignedUserTypes.includes(typeId)
        ? prev.assignedUserTypes.filter((id) => id !== typeId)
        : [...prev.assignedUserTypes, typeId],
    }));
  };

  const handleSave = () => {
    const result = pendingTaskSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSave(result.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_select]:text-black [&_span]:text-black">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">Asignar tarea</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Nombre de la tarea"
            required
            name="taskName"
            placeholder="Ej. Actualizar inventario"
            startAdornment={<ClipboardList size={16} />}
            value={formData.taskName}
            onChange={handleChange}
            error={errors.taskName}
          />

          <Select
            label="Estado de la tarea"
            required
            name="status"
            options={[{ id: "", label: "Selecciona un estado" }, ...TASK_STATUS_OPTIONS]}
            value={formData.status}
            onChange={handleChange}
            error={errors.status}
          />

          <MultiSelectField
            label="Tipo(s) de usuario"
            required
            icon={UserCog}
            placeholder="Selecciona uno o más tipos"
            options={USER_TYPE_OPTIONS}
            selected={formData.assignedUserTypes}
            onToggle={toggleUserType}
            error={errors.assignedUserTypes}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Fecha inicio"
              required
              name="startDate"
              type="date"
              startAdornment={<CalendarDays size={16} />}
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />

            <Input
              label="Fecha fin"
              required
              name="endDate"
              type="date"
              startAdornment={<CalendarCheck size={16} />}
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
            />
          </div>

          <Input
            label="Descripción"
            required
            name="description"
            placeholder="Explica en qué consiste la tarea"
            startAdornment={<FileText size={16} />}
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="button" onClick={handleSave} className="gap-2">
            <Check size={16} />
            Guardar tarea
          </Button>
        </div>
      </div>
    </div>
  );
}
