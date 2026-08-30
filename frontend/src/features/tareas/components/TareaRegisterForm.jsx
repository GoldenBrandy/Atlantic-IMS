import { useState, useEffect, useMemo } from "react";
import { tareaSchema } from "../schemas/tareaSchema";
import { createTarea, updateTarea, getTareaById } from "../services/tareaService";
import { TASK_STATUS_OPTIONS, USER_TYPE_OPTIONS } from "../services/tareaOptionsService";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { Input, Button, Select, IconButton, MultiSelectField, StepIndicator, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import {
  MoveLeft,
  Users,
  UserCog,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { sileo } from "sileo";

// Campos que valida cada paso, para bloquear "Siguiente" solo cuando el
// paso ACTUAL tiene errores (los de pasos futuros se validan al llegar).
const STEP_FIELDS = [
  ["assignedUsers", "assignedUserTypes"],
  ["taskName", "status", "startDate", "endDate", "userEndDates"],
  ["description"],
];

const steps = ["Asignación", "Detalles y fechas", "Descripción"];

export default function TareaRegisterForm({
  tareaId = null,
  nextTo = "/dashboard/tareas",
  cancelTo = "/dashboard/tareas",
  showBackButton = false,
  backTo = "/dashboard/tareas",
}) {
  const isEditing = Boolean(tareaId);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const userOptions = useMemo(
    () => users.map((user) => ({ id: String(user.id), label: formatUserName(user) })),
    [users],
  );

  const [formData, setFormData] = useState({
    assignedUsers: [],
    assignedUserTypes: [],
    taskName: "",
    status: "",
    startDate: "",
    endDate: "",
    description: "",
    userEndDates: {},
  });

  // Precarga los datos de la tarea desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getTareaById(tareaId)
      .then((tarea) => {
        const endDate = tarea.end_date ? String(tarea.end_date).slice(0, 10) : "";
        const userEndDates = {};
        Object.entries(tarea.assigned_user_end_dates ?? {}).forEach(([userId, date]) => {
          userEndDates[userId] = date ? String(date).slice(0, 10) : endDate;
        });
        setFormData({
          assignedUsers: (tarea.assigned_users ?? []).map(String),
          assignedUserTypes: tarea.assigned_user_types ?? [],
          taskName: tarea.task_name ?? "",
          status: tarea.status ?? "",
          startDate: tarea.start_date ? String(tarea.start_date).slice(0, 10) : "",
          endDate,
          description: tarea.description ?? "",
          userEndDates,
        });
      })
      .catch((err) => {
        sileo.error({
          title: "Tarea no encontrada",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, tareaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAssignedUser = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.assignedUsers.includes(userId);
      const assignedUsers = isSelected
        ? prev.assignedUsers.filter((id) => id !== userId)
        : [...prev.assignedUsers, userId];

      const userEndDates = { ...prev.userEndDates };
      if (isSelected) {
        delete userEndDates[userId];
      } else {
        userEndDates[userId] = prev.endDate || "";
      }

      return { ...prev, assignedUsers, userEndDates };
    });
  };

  const handleUserEndDateChange = (userId, value) => {
    setFormData((prev) => ({
      ...prev,
      userEndDates: { ...prev.userEndDates, [userId]: value },
    }));
  };

  const toggleUserType = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      assignedUserTypes: prev.assignedUserTypes.includes(typeId)
        ? prev.assignedUserTypes.filter((id) => id !== typeId)
        : [...prev.assignedUserTypes, typeId],
    }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => tareaSchema.safeParse(formData);

  const goBack = () => setCurrentStep((step) => Math.max(0, step - 1));

  const goNext = () => {
    const result = validate();
    const stepFields = STEP_FIELDS[currentStep] ?? [];

    if (!result.success) {
      const fieldErrors = {};
      let blocksAdvance = false;
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        fieldErrors[key] = issue.message;
        if (stepFields.includes(key)) blocksAdvance = true;
      });
      setErrors(fieldErrors);
      if (blocksAdvance) return;
    } else {
      setErrors({});
    }

    setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validate();

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      const firstErrorStep = STEP_FIELDS.findIndex((fields) =>
        result.error.issues.some((issue) => fields.includes(issue.path[0])),
      );
      if (firstErrorStep !== -1 && firstErrorStep !== currentStep) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateTarea(tareaId, result.data);
        sileo.success({
          title: "Tarea actualizada",
          description: `${result.data.taskName} se actualizó correctamente`,
        });
      } else {
        const res = await createTarea(result.data);
        sileo.success({
          title: "Tarea creada",
          description: res?.message ?? "Tarea creada correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar la tarea",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_select]:text-black [&_span]:text-black">
        {showBackButton && (
          <div className="mb-4">
            <IconButton ariaLabel="Volver" variant="ghost" onClick={() => navigate(backTo)}>
              <MoveLeft />
            </IconButton>
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar tarea" : "Nueva tarea"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información de la tarea
          </p>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            {currentStep === 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Asignación</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MultiSelectField
                    label="Usuario(s)"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    icon={Users}
                    placeholder="Selecciona uno o más usuarios"
                    options={userOptions}
                    selected={formData.assignedUsers}
                    onToggle={toggleAssignedUser}
                    error={errors.assignedUsers}
                  />

                  <MultiSelectField
                    label="Tipo(s) de usuario"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    icon={UserCog}
                    placeholder="Selecciona uno o más tipos"
                    options={USER_TYPE_OPTIONS}
                    selected={formData.assignedUserTypes}
                    onToggle={toggleUserType}
                    error={errors.assignedUserTypes}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">Detalles de la tarea</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Nombre de la tarea"
                      required
                      dense
                      labelClassName={bigLabelClass}
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
                      dense
                      labelClassName={bigLabelClass}
                      name="status"
                      options={[{ id: "", label: "Selecciona un estado" }, ...TASK_STATUS_OPTIONS]}
                      value={formData.status}
                      onChange={handleChange}
                      error={errors.status}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">Fechas</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Fecha inicio"
                      required
                      dense
                      labelClassName={bigLabelClass}
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
                      dense
                      labelClassName={bigLabelClass}
                      name="endDate"
                      type="date"
                      startAdornment={<CalendarCheck size={16} />}
                      value={formData.endDate}
                      onChange={handleChange}
                      error={errors.endDate}
                    />

                    {formData.assignedUsers.length > 1 && (
                      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-black/20 p-3">
                        <p className="text-caption font-medium">
                          Fecha de finalización por usuario
                        </p>

                        {formData.assignedUsers.map((userId) => {
                          const user = users.find((u) => String(u.id) === String(userId));
                          return (
                            <div key={userId} className="flex items-center gap-2">
                              <span className="flex-1 truncate text-caption">
                                {user ? formatUserName(user) : userId}
                              </span>
                              <input
                                type="date"
                                value={formData.userEndDates[userId] ?? ""}
                                onChange={(e) => handleUserEndDateChange(userId, e.target.value)}
                                className="w-40 rounded-md border border-black/20 px-2 py-1 text-caption text-black"
                              />
                            </div>
                          );
                        })}

                        {errors.userEndDates && (
                          <p className="text-caption text-red-800">{errors.userEndDates}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Descripción</h2>

                <Input
                  label="Descripción de la tarea"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="description"
                  placeholder="Explica en qué consiste la tarea"
                  startAdornment={<FileText size={16} />}
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              {currentStep === 0 ? (
                <Button variant="secondary" type="button" onClick={() => navigate(cancelTo)}>
                  Cancelar
                </Button>
              ) : (
                <Button variant="secondary" type="button" className="gap-2" onClick={goBack}>
                  <ArrowLeft size={16} />
                  Atrás
                </Button>
              )}

              {isLastStep ? (
                <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                  <Check size={16} />
                  {isSubmitting ? "Guardando..." : "Guardar tarea"}
                </Button>
              ) : (
                <Button variant="primary" type="button" className="gap-2 rounded-full" onClick={goNext}>
                  Siguiente
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
