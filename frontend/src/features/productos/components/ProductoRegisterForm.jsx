import { useState, useEffect, useMemo, useRef } from "react";
import { productoSchema } from "../schemas/productoSchema";
import { createProducto, updateProducto, getProductoById } from "../services/productoService";
import { getProductTypeOptions, getCategoryOptions } from "../services/productoOptionsService";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { Input, Button, Select, IconButton, StepIndicator, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MoveLeft,
  Package,
  Hash,
  MapPin,
  Boxes,
  Truck,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { sileo } from "sileo";

// Campos que valida cada paso, para bloquear "Siguiente" solo cuando el
// paso ACTUAL tiene errores (los de pasos futuros se validan al llegar).
const STEP_FIELDS = [
  ["name", "type", "category"],
  ["responsible", "location", "quantity"],
  ["supplier", "observations"],
];

const steps = ["Información General", "Inventario", "Proveedor y observaciones"];

export default function ProductoRegisterForm({
  productoId = null,
  nextTo = "/dashboard/productos",
  cancelTo = "/dashboard/productos",
  showBackButton = false,
  backTo = "/dashboard",
}) {
  const isEditing = Boolean(productoId);
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [typeOptions, setTypeOptions] = useState([{ id: "", label: "Selecciona tipo" }]);
  const [categoryOptions, setCategoryOptions] = useState([{ id: "", label: "Selecciona categoria" }]);

  useEffect(() => {
    getProductTypeOptions().then((data) => setTypeOptions((prev) => [prev[0], ...data]));
    getCategoryOptions().then((data) => setCategoryOptions((prev) => [prev[0], ...data]));
  }, []);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const responsibleOptions = useMemo(
    () => [{ id: "", label: "Selecciona responsable" }, ...users.map((user) => ({ id: String(user.id), label: formatUserName(user) }))],
    [users],
  );

  const [productCode, setProductCode] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    responsible: "",
    location: "",
    quantity: "",
    supplier: "",
    observations: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Precarga los datos del producto desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getProductoById(productoId)
      .then((producto) => {
        setFormData({
          name: producto.name ?? "",
          type: producto.type ?? "",
          category: producto.category ?? "",
          responsible: producto.responsible ? String(producto.responsible) : "",
          location: producto.location ?? "",
          quantity: producto.quantity ?? "",
          supplier: producto.supplier ?? "",
          observations: producto.observations ?? "",
        });
        setImagePreview(producto.image_url ?? null);
        setProductCode(producto.product_code ?? "");
      })
      .catch((err) => {
        sileo.error({
          title: "Producto no encontrado",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, productoId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => productoSchema.safeParse({ ...formData, image: imagePreview ?? "" });

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
        await updateProducto(productoId, { ...result.data, imageUrl: imagePreview });
        sileo.success({
          title: "Producto actualizado",
          description: `${result.data.name} se actualizó correctamente`,
        });
      } else {
        const res = await createProducto({ ...result.data, imageUrl: imagePreview });
        sileo.success({
          title: "Producto creado",
          description: res?.message ?? "Producto creado correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar el producto",
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
            <IconButton
              ariaLabel="Volver"
              variant="ghost"
              onClick={() => navigate(backTo)}
            >
              <MoveLeft />
            </IconButton>
          </div>
        )}

        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información del producto
          </p>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            {currentStep === 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Información General</h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
                  <div className="flex flex-col items-center gap-2 sm:items-start">
                    <p className="text-sm font-semibold text-black">
                      Foto del producto <span className="font-normal text-neutral-400">(opcional)</span>
                    </p>

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      aria-label="Agregar imagen del producto"
                      className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Imagen del producto" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <Upload size={18} />
                          <span className="text-caption">Subir foto</span>
                        </>
                      )}
                    </button>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="name"
                      placeholder="Nombre del producto"
                      startAdornment={<Package size={16} />}
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                    />
                    {isEditing && (
                      <Input
                        label="Código (generado automáticamente)"
                        disabled
                        readOnly
                        dense
                        labelClassName={bigLabelClass}
                        startAdornment={<Hash size={16} />}
                        value={productCode}
                      />
                    )}
                    <Select
                      label="Tipo"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="type"
                      options={typeOptions}
                      value={formData.type}
                      onChange={handleChange}
                      error={errors.type}
                    />
                    <Select
                      label="Categoría"
                      required
                      dense
                      labelClassName={bigLabelClass}
                      name="category"
                      options={categoryOptions}
                      value={formData.category}
                      onChange={handleChange}
                      error={errors.category}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Inventario</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    label="Responsable"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="responsible"
                    options={responsibleOptions}
                    value={formData.responsible}
                    onChange={handleChange}
                    error={errors.responsible}
                  />
                  <Input
                    label="Ubicación"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="location"
                    placeholder="Ubicación"
                    startAdornment={<MapPin size={16} />}
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                  />
                  <Input
                    label="Cantidad"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="quantity"
                    placeholder="Cantidad"
                    type="number"
                    min="0"
                    startAdornment={<Boxes size={16} />}
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">Proveedor y observaciones</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Proveedor / origen"
                    required
                    dense
                    labelClassName={bigLabelClass}
                    name="supplier"
                    placeholder="Proveedor / origen"
                    startAdornment={<Truck size={16} />}
                    value={formData.supplier}
                    onChange={handleChange}
                    error={errors.supplier}
                  />
                  <Input
                    label="Observaciones (opcional)"
                    dense
                    labelClassName={bigLabelClass}
                    name="observations"
                    placeholder="Observaciones"
                    startAdornment={<FileText size={16} />}
                    value={formData.observations}
                    onChange={handleChange}
                    error={errors.observations}
                  />
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
                  {isSubmitting ? "Guardando..." : isEditing ? "Guardar producto" : "Crear"}
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