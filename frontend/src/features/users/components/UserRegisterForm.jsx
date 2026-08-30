import { useState, useEffect, useMemo, useRef } from "react";
import { getDocumentTypes } from "../services/selectService";
import { getGroups } from "../../access/services/groupService";
import { userSchema } from "../schemas/userSchema";
import { createUser, getUserById, updateUser, setUserActive } from "../services/userService";
import { createTarea } from "@/features/tareas/services/tareaService";
import AsignarTareaModal from "./AsignarTareaModal";
import { Input, Button, Select, Checkbox, IconButton, DataConsentCard, StepIndicator, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import {
  MoveLeft,
  Upload,
  User,
  IdCard,
  Hash,
  UserCog,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  CalendarCheck,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { sileo } from 'sileo';

// Campos del schema que validan cada paso, para poder bloquear el avance a
// "Siguiente" solo cuando el paso ACTUAL tiene errores (los de pasos
// futuros se validan cuando el usuario llegue a ellos).
const STEP_FIELDS = [
  ["avatarImage", "userFirstName", "userLastName1", "userDocumentType", "userDocumentNumber"],
  ["userEmail", "userInstitutionalEmail", "userPhone", "userSecondaryPhone", "userAddress"],
  ["userGroup", "userStartDate", "userEndDate"],
];

export default function UserRegisterForm({
  userId = null,
  backgroundImage = null,
  nextTo = "/dashboard",
  cancelTo = "/dashboard",
  showBackButton = false,
  backTo = "/dashboard",
  title,
  subtitle,
  isRenewal = false,
}) {
  const isEditing = Boolean(userId);
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dataConsent, setDataConsent] = useState(false);
  const [consentError, setConsentError] = useState("");

  const steps = useMemo(
    () =>
      isEditing
        ? ["Información General", "Contacto", "Rol y Vinculación"]
        : ["Información General", "Contacto", "Rol y Vinculación", "Tareas"],
    [isEditing],
  );

  const [formData, setFormData] = useState({
    userFirstName: "",
    userLastName1: "",
    userDocumentType: "",
    userDocumentNumber: "",
    userGroup: "",
    userEmail: "",
    userInstitutionalEmail: "",
    userPhone: "",
    userSecondaryPhone: "",
    userAddress: "",
    userStartDate: "",
    userEndDate: "",
    isInstructorFullTime: false,
    isCustodian: false,
  });

  const documentTypeOptions = useMemo(
    () => [
      { id: "", label: "Selecciona tipo de documento" },
      ...documentTypes,
    ],
    [documentTypes],
  );

  const groupOptions = useMemo(
    () => [
      { id: "", label: "Selecciona tipo de usuario" },
      ...groups.map((group) => ({
        id: String(group.group_id),
        label: group.group_name,
      })),
    ],
    [groups],
  );

  const selectedGroupName = useMemo(
    () => groups.find((group) => String(group.group_id) === formData.userGroup)?.group_name ?? "",
    [groups, formData.userGroup],
  );
  const isInstructorRole = selectedGroupName.trim().toLowerCase() === "instructor";

  useEffect(() => {
    getDocumentTypes().then(setDocumentTypes);
    getGroups()
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    getUserById(userId)
      .then((user) => {
        setFormData((prev) => ({
          ...prev,
          userFirstName: user.user_name ?? "",
          userLastName1: user.last_name_1 ?? "",
          userDocumentType: user.document_type ?? "",
          userDocumentNumber: user.document_number ?? "",
          userGroup: user.group_id ? String(user.group_id) : "",
          userEmail: user.user_email ?? "",
          userInstitutionalEmail: user.institutional_email ?? "",
          userPhone: user.user_phone ?? "",
          userSecondaryPhone: user.secondary_phone ?? "",
          userAddress: user.address ?? "",
          userStartDate: isRenewal ? "" : user.start_date ? String(user.start_date).slice(0, 10) : "",
          userEndDate: isRenewal ? "" : user.end_date ? String(user.end_date).slice(0, 10) : "",
          isInstructorFullTime: user.is_staff ?? false,
          isCustodian: user.is_custodian ?? false,
        }));
        setAvatarPreview(user.avatar_url ?? null);
      })
      .catch((err) => {
        sileo.error({
          title: "No se pudo cargar el usuario",
          description: err?.message || String(err)
        });
      });
  }, [isEditing, userId, isRenewal]);

  // La imagen se guarda como data URL (en vez de object URL) para que se
  // pueda persistir como avatar_url y sobreviva al desmontar el formulario.
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // El numero de documento unicamente admite digitos.
      if (name === "userDocumentNumber") {
        next.userDocumentNumber = value.replace(/[^0-9]/g, "");
      }

      if (name === "userGroup") {
        const groupName = groups.find((group) => String(group.group_id) === value)?.group_name ?? "";
        if (groupName.trim().toLowerCase() !== "instructor") {
          next.isInstructorFullTime = false;
        }
      }

      return next;
    });
  };

  const openNewTaskModal = () => {
    setEditingTaskIndex(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (index) => {
    setEditingTaskIndex(index);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    setPendingTasks((prev) => {
      if (editingTaskIndex === null) return [...prev, taskData];
      const next = [...prev];
      next[editingTaskIndex] = taskData;
      return next;
    });
  };

  const handleRemoveTask = (index) => {
    setPendingTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () =>
    userSchema.safeParse({
      ...formData,
      avatarImage: avatarPreview ?? "",
    });

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

    if (!dataConsent) {
      setConsentError("Debes autorizar el tratamiento de tus datos personales para continuar");
      sileo.error({
        title: "Autorización requerida",
        description: "Debes autorizar el tratamiento de tus datos personales para continuar",
      });
      return;
    }
    setConsentError("");

    const result = validate();

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      // Si el error quedo en un paso anterior, regresa a el para que se vea.
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
      const payload = {
        firstName: result.data.userFirstName,
        lastName1: result.data.userLastName1,
        documentType: result.data.userDocumentType,
        documentNumber: result.data.userDocumentNumber,
        group: result.data.userGroup,
        userEmail: result.data.userEmail,
        institutionalEmail: result.data.userInstitutionalEmail,
        phone: result.data.userPhone,
        secondaryPhone: result.data.userSecondaryPhone,
        address: result.data.userAddress,
        startDate: result.data.userStartDate,
        endDate: result.data.userEndDate,
        avatarUrl: result.data.avatarImage,
        isStaff: result.data.isInstructorFullTime ?? false,
        isCustodian: result.data.isCustodian ?? false,
      };

      const res = isEditing
        ? await updateUser(userId, payload)
        : await createUser(payload);

      if (isEditing && isRenewal) {
        await setUserActive(userId, true);
      }

      sileo.success({
        title: isRenewal ? 'Usuario renovado' : isEditing ? 'Usuario actualizado' : 'Usuario creado',
        description: res?.message ?? (isRenewal ? "El usuario se renovó y quedó activo" :isEditing ? 'Usuario Actualizado correctamente' : 'Usuario creado correctamente'),
      });

      if (!isEditing && pendingTasks.length > 0 && res?.userId) {
        const results = await Promise.allSettled(
          pendingTasks.map((task) =>
            createTarea({
              ...task,
              assignedUsers: [String(res.userId)],
              userEndDates: {},
            }),
          ),
        );
        const failedCount = results.filter((r) => r.status === "rejected").length;

        if (failedCount === 0) {
          sileo.success({
            title: pendingTasks.length > 1 ? 'Tareas asignadas' : 'Tarea asignada',
            description: `${pendingTasks.length} tarea(s) se asignaron correctamente al nuevo usuario`,
          });
        } else {
          sileo.error({
            title: 'El usuario se creó, pero algunas tareas no pudieron asignarse',
            description: `${failedCount} de ${pendingTasks.length} tarea(s) fallaron`,
          });
        }
      }

      navigate(nextTo);
    } catch (err) {
      console.error(err);
      if (err?.field) {
        setErrors({ [err.field]: err.message });
      }
      sileo.error({
        title: 'Error al guardar el usuario',
        description: err?.message || String(err)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div
      className={`relative min-h-full w-full flex-1 overflow-hidden p-6 ${backgroundImage ? "bg-cover bg-center" : ""}`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
            }
          : undefined
      }
    >
      <div className="relative text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_select]:text-black [&_span]:text-black">
        {showBackButton && (
          <div className="mb-4">
            <IconButton
              ariaLabel="Volver"
              variant="ghost"
              onClick={() => navigate(backTo)}
              className="text-black"
            >
              <MoveLeft />
            </IconButton>
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {title ?? (isRenewal ? "Renovar usuario" : isEditing ? "Editar usuario" : "Nuevo usuario")}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            {subtitle ?? (isRenewal ? "Actualiza la información y captura las nuevas fechas para reactivar al usuario" : "Completa la información del usuario")}
          </p>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
          >
            {currentStep === 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Información General</h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
                  <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-sm font-semibold text-black">
                      Foto de perfil <span className="font-normal text-neutral-400">(opcional)</span>
                    </p>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Agregar foto de perfil"
                      className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Foto de perfil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <Upload size={18} />
                          <span className="text-caption">Subir foto</span>
                        </>
                      )}
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombres"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="userFirstName"
                      placeholder="Ej. Juan Andrés"
                      startAdornment={<User size={16} />}
                      value={formData.userFirstName}
                      onChange={handleChange}
                      error={errors.userFirstName}
                    />

                    <Input
                      label="Apellidos"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="userLastName1"
                      placeholder="Ej. Pérez Gómez"
                      startAdornment={<User size={16} />}
                      value={formData.userLastName1}
                      onChange={handleChange}
                      error={errors.userLastName1}
                    />

                    <Select
                      label="Tipo de Documento"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="userDocumentType"
                      startAdornment={<IdCard size={16} />}
                      options={documentTypeOptions}
                      value={formData.userDocumentType}
                      onChange={handleChange}
                      error={errors.userDocumentType}
                    />

                    <Input
                      label="Número de Documento"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="userDocumentNumber"
                      placeholder="Ej. 1029384756"
                      inputMode="numeric"
                      startAdornment={<Hash size={16} />}
                      value={formData.userDocumentNumber}
                      onChange={handleChange}
                      error={errors.userDocumentNumber}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Contacto</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Correo Electrónico"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userEmail"
                    placeholder="correo@ejemplo.com"
                    type="email"
                    autoComplete="off"
                    startAdornment={<Mail size={16} />}
                    value={formData.userEmail}
                    onChange={handleChange}
                    error={errors.userEmail}
                  />

                  <Input
                    label="Correo Institucional (opcional)"
                    dense
                    labelClassName={bigLabelClass}
                    name="userInstitutionalEmail"
                    placeholder="nombre@sena.edu.co"
                    type="email"
                    startAdornment={<Mail size={16} />}
                    value={formData.userInstitutionalEmail}
                    onChange={handleChange}
                    error={errors.userInstitutionalEmail}
                  />

                  <Input
                    label="Número de Celular"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userPhone"
                    placeholder="3001234567"
                    type="tel"
                    startAdornment={<Phone size={16} />}
                    value={formData.userPhone}
                    onChange={handleChange}
                    error={errors.userPhone}
                  />

                  <Input
                    label="Teléfono secundario (opcional)"
                    dense
                    labelClassName={bigLabelClass}
                    name="userSecondaryPhone"
                    placeholder="30019876543"
                    type="tel"
                    startAdornment={<Phone size={16} />}
                    value={formData.userSecondaryPhone}
                    onChange={handleChange}
                    error={errors.userSecondaryPhone}
                  />

                  <Input
                    label="Dirección"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userAddress"
                    placeholder="Calle 10 # 20-30"
                    startAdornment={<MapPin size={16} />}
                    value={formData.userAddress}
                    onChange={handleChange}
                    error={errors.userAddress}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Rol y Vinculación</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Tipo de Usuario"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userGroup"
                    startAdornment={<UserCog size={16} />}
                    options={groupOptions}
                    value={formData.userGroup}
                    onChange={handleChange}
                    error={errors.userGroup}
                  />

                  {isInstructorRole && (
                    <div className="flex items-center sm:col-span-2">
                      <Checkbox
                        id="isInstructorFullTime"
                        name="isInstructorFullTime"
                        label="Instructor de planta"
                        checked={formData.isInstructorFullTime}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="flex items-center sm:col-span-2">
                    <Checkbox
                      id="isCustodian"
                      name="isCustodian"
                      label="Es cuentadante"
                      checked={formData.isCustodian}
                      onChange={handleChange}
                    />
                  </div>

                  <Input
                    label="Fecha de Inicio"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userStartDate"
                    type="date"
                    startAdornment={<CalendarDays size={16} />}
                    value={formData.userStartDate}
                    onChange={handleChange}
                    error={errors.userStartDate}
                  />

                  <Input
                    label="Fecha de Finalizacion"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="userEndDate"
                    type="date"
                    startAdornment={<CalendarCheck size={16} />}
                    value={formData.userEndDate}
                    onChange={handleChange}
                    error={errors.userEndDate}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && !isEditing && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Tareas asignadas (opcional)</h2>

                {pendingTasks.length > 0 && (
                  <div className="mb-4 flex flex-col gap-3">
                    {pendingTasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 rounded-lg border border-black/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <ClipboardList size={16} />
                          <span>
                            <strong>{task.taskName}</strong> · {task.startDate} a {task.endDate}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" type="button" onClick={() => openEditTaskModal(index)}>
                            Editar
                          </Button>
                          <Button variant="secondary" type="button" onClick={() => handleRemoveTask(index)}>
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="secondary" type="button" className="gap-2" onClick={openNewTaskModal}>
                  <ClipboardList size={16} />
                  {pendingTasks.length > 0 ? "Agregar otra tarea" : "Asignar tarea"}
                </Button>
              </div>
            )}

            {isLastStep && (
              <DataConsentCard
                purpose="(nombres, apellidos, documento de identidad, fotografía, correo electrónico, número de celular, dirección y demás información aquí registrada)"
                given={dataConsent}
                onToggle={() => {
                  setDataConsent((prev) => !prev);
                  setConsentError("");
                }}
                error={consentError}
              />
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
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || !dataConsent}
                  className="gap-2 rounded-full"
                >
                  <Check size={16} />
                  {isSubmitting ? "Guardando..." : isEditing ? "Guardar usuario" : "Crear"}
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

      {isTaskModalOpen && (
        <AsignarTareaModal
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          initialData={editingTaskIndex !== null ? pendingTasks[editingTaskIndex] : null}
        />
      )}
    </div>
  );
}
