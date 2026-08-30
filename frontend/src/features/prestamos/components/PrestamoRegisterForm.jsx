import { useState, useEffect, useMemo, useRef } from "react";
import { prestamoSchema } from "../schemas/prestamoSchema";
import { createPrestamo, updatePrestamo, getPrestamoById } from "../services/prestamoService";
import { getLoanTypeOptions } from "../services/prestamoOptionsService";
import { getMateriales } from "@/features/materiales/services/materialService";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { Input, Button, Select, IconButton, MultiSelectField, StepIndicator, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import {
  MoveLeft,
  Package,
  Repeat,
  User,
  UserCheck,
  IdCard,
  CalendarDays,
  CalendarCheck,
  FileText,
  Upload,
  FileSignature,
  ShieldCheck,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { sileo } from "sileo";

// Campos que valida cada paso, para bloquear "Siguiente" solo cuando el
// paso ACTUAL tiene errores (los de pasos futuros se validan al llegar).
const STEP_FIELDS = [
  ["materialIds", "loanType", "ficha"],
  ["requestingUser", "lendingUser", "startDate", "dueDate"],
  ["justification"],
  ["signatureUrl"],
];

const steps = ["Información General", "Usuarios y fechas", "Justificación", "Legalización"];

export default function PrestamoRegisterForm({
  prestamoId = null,
  nextTo = "/dashboard/prestamos",
  cancelTo = "/dashboard/prestamos",
  showBackButton = false,
  backTo = "/dashboard/prestamos",
}) {
  const isEditing = Boolean(prestamoId);
  const navigate = useNavigate();
  const signatureInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [loanTypeOptions, setLoanTypeOptions] = useState([{ id: "", label: "Selecciona tipo de préstamo" }]);

  useEffect(() => {
    getLoanTypeOptions().then((data) => setLoanTypeOptions((prev) => [prev[0], ...data]));
  }, []);

  const [materiales, setMateriales] = useState([]);

  useEffect(() => {
    getMateriales().then(setMateriales).catch(console.error);
  }, []);

  // Solo se puede prestar (y devolver) material devolutivo: el de consumo no vuelve.
  const materialOptions = useMemo(
    () =>
      materiales
        .filter((material) => material.type === "Devolutivo")
        .map((material) => ({ id: String(material.id), label: material.name })),
    [materiales],
  );

  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const userOptions = useMemo(
    () => [{ id: "", label: "Selecciona un usuario" }, ...users.map((user) => ({ id: String(user.id), label: formatUserName(user) }))],
    [users],
  );

  const [formData, setFormData] = useState({
    materialIds: [],
    requestingUser: "",
    lendingUser: "",
    ficha: "",
    justification: "",
    loanType: "",
    startDate: "",
    dueDate: "",
  });

  const [identityConfirmed, setIdentityConfirmed] = useState(false);

  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureFileName, setSignatureFileName] = useState("");

  // Precarga los datos del prestamo desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getPrestamoById(prestamoId)
      .then((prestamo) => {
        setFormData({
          materialIds: (prestamo.material_ids ?? []).map(String),
          requestingUser: prestamo.requesting_user ? String(prestamo.requesting_user) : "",
          lendingUser: prestamo.lending_user ? String(prestamo.lending_user) : "",
          ficha: prestamo.ficha ?? "",
          justification: prestamo.justification ?? "",
          loanType: prestamo.loan_type ?? "",
          startDate: prestamo.start_date ? String(prestamo.start_date).slice(0, 10) : "",
          dueDate: prestamo.due_date ? String(prestamo.due_date).slice(0, 10) : "",
        });
        setSignaturePreview(prestamo.signature_url ?? null);
      })
      .catch((err) => {
        sileo.error({
          title: "Préstamo no encontrado",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, prestamoId]);

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setSignaturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMaterial = (materialId) => {
    setFormData((prev) => ({
      ...prev,
      materialIds: prev.materialIds.includes(materialId)
        ? prev.materialIds.filter((id) => id !== materialId)
        : [...prev.materialIds, materialId],
    }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => prestamoSchema.safeParse({ ...formData, signatureUrl: signaturePreview ?? "" });

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
        await updatePrestamo(prestamoId, result.data);
        sileo.success({
          title: "Préstamo actualizado",
          description: "El préstamo se actualizó correctamente",
        });
      } else {
        const res = await createPrestamo(result.data);
        sileo.success({
          title: "Préstamo creado",
          description: res?.message ?? "Préstamo creado correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      if (err?.field) {
        setErrors({ [err.field]: err.message });
      }
      sileo.error({
        title: "Error al guardar el préstamo",
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
            {isEditing ? "Editar préstamo" : "Nuevo préstamo"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información del préstamo
          </p>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            {currentStep === 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Información General</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MultiSelectField
                    label="Ítem(s) a prestar"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    icon={Package}
                    placeholder="Selecciona uno o más ítems"
                    options={materialOptions}
                    selected={formData.materialIds}
                    onToggle={toggleMaterial}
                    error={errors.materialIds}
                  />

                  <Select
                    label="Tipo de préstamo"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="loanType"
                    startAdornment={<Repeat size={16} />}
                    options={loanTypeOptions}
                    value={formData.loanType}
                    onChange={handleChange}
                    error={errors.loanType}
                  />

                  <Input
                    label="Ficha de aprendices"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="ficha"
                    placeholder="Ej. 2699045"
                    startAdornment={<IdCard size={16} />}
                    value={formData.ficha}
                    onChange={handleChange}
                    error={errors.ficha}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">Usuarios involucrados</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Usuario solicitante"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="requestingUser"
                      startAdornment={<User size={16} />}
                      options={userOptions}
                      value={formData.requestingUser}
                      onChange={handleChange}
                      error={errors.requestingUser}
                    />

                    <div className="flex flex-col gap-2">
                      <Select
                        label="Usuario prestador"
                        required
                        dense
                        labelClassName={bigLabelClass}
                        name="lendingUser"
                        startAdornment={<UserCheck size={16} />}
                        options={userOptions}
                        value={formData.lendingUser}
                        onChange={handleChange}
                        error={errors.lendingUser}
                      />

                      <Button
                        type="button"
                        variant={identityConfirmed ? "primary" : "secondary"}
                        size="sm"
                        className="w-fit gap-2"
                        onClick={() => setIdentityConfirmed((prev) => !prev)}
                      >
                        {identityConfirmed ? <BadgeCheck size={16} /> : <ShieldCheck size={16} />}
                        {identityConfirmed ? "Identidad confirmada" : "Confirmar identidad"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">Fechas</h2>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Fecha de salida"
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
                      label="Fecha de entrega"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="dueDate"
                      type="date"
                      startAdornment={<CalendarCheck size={16} />}
                      value={formData.dueDate}
                      onChange={handleChange}
                      error={errors.dueDate}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Justificación</h2>

                <Input
                  label="Justificación de uso"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="justification"
                  placeholder="Explique el motivo del préstamo"
                  startAdornment={<FileText size={16} />}
                  value={formData.justification}
                  onChange={handleChange}
                  error={errors.justification}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Legalización</h2>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-black">
                    Firma digital<span className="text-red-600!"> *</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    aria-label="Adjuntar firma digital"
                    className="flex h-28 w-full max-w-xs flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
                  >
                    {signaturePreview ? (
                      signaturePreview.startsWith("data:image") ? (
                        <img src={signaturePreview} alt="Firma digital" className="h-full w-full object-contain" />
                      ) : (
                        <>
                          <FileSignature size={20} />
                          <span className="text-caption">{signatureFileName || "Documento adjunto"}</span>
                        </>
                      )
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="text-caption">Subir imagen o documento</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={handleSignatureChange}
                  />

                  {errors.signatureUrl && (
                    <p className="text-caption text-red-800">{errors.signatureUrl}</p>
                  )}
                </div>
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
                  {isSubmitting ? "Guardando..." : "Guardar préstamo"}
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