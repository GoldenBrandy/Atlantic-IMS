import { useState, useEffect, useRef, useMemo } from "react";
import { getMaterialTypes, MATERIAL_CATEGORY_OPTIONS } from "../services/materialTypeService";
import { materialSchema } from "../schemas/materialSchema";
import { createMaterial, updateMaterial, getMaterialById } from "../services/materialService";
import { getMarcas } from "@/features/marcas/services/marcaService";
import { getInventarios } from "@/features/inventarios/services/inventarioService";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { Input, Button, Select, IconButton, StepIndicator, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MoveLeft,
  Package,
  Hash,
  FileText,
  FileSpreadsheet,
  Tag,
  Fingerprint,
  UserCog,
  MapPin,
  CalendarDays,
  DollarSign,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { sileo } from "sileo";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

const EXTENDED_STEPS = ["Información General", "Inventario", "Valores"];
const SIMPLE_STEPS = ["Información General", "Detalles adicionales"];

const EXTENDED_STEP_FIELDS = [
  ["materialName", "model", "senaPlate", "category", "externalId", "marca", "custodian", "materialDescription", "technicalSheetImages", "quotations"],
  ["materialQuantity", "location", "purchaseDate"],
  ["unitValue"],
];
const SIMPLE_STEP_FIELDS = [
  ["materialName", "materialType"],
  ["materialQuantity", "materialDescription"],
];

// Selector de hasta `max`fotos del material , guardadas como data-URLs.
function ImagePicker({ previews, onAdd, onRemove, max }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-semibold text-black">
        Foto del material <span className="font-normal text-neutral-400">
          (opcional, máx. {max})</span>
      </p>

      <div className="flex gap-2">
        {previews.map((preview, index) => (
          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <img src={preview} alt={`Foto del material ${index + 1}`}
            className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="Quitar foto"
            onClick={() => onRemove(index)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {previews.length < max && (
        <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Agregar foto del material"
        className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
        >
          <Upload size={18} />
          <span className="text-caption">Subir foto</span>
        </button>
      )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple={max > 1} hidden onChange={handleChange} />
    </div>
  );
}

// Selector de hasta `max` fichas tecnicas (imagenes). Se usa tanto para
// Consumo (max 1) como para Devolutivo (max 3), guardadas como un arreglo
// de data-URLs en la misma columna technical_sheet_urls.
function TechnicalSheetPicker({ previews, onAdd, onRemove, max, required, error }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-semibold text-black">
        Ficha técnica <span className="font-normal text-neutral-400">
          {required ? "(obligatorio)" : `(opcional${max > 1 ? `, máx. ${max}` : ""})`}
        </span>
      </p>

      <div className="flex gap-2">
        {previews.map((preview, index) => (
          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
            <img src={preview} alt={`Ficha técnica ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Quitar ficha técnica"
              onClick={() => onRemove(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {previews.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Agregar ficha técnica"
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
          >
            <FileSpreadsheet size={18} />
            <span className="text-caption">Subir ficha</span>
          </button>
        )}
      </div>

      {error && <p className="text-caption text-red-800">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" multiple={max > 1} hidden onChange={handleChange} />
    </div>
  );
}

// Selector de 1 a `max` cotizaciones en PDF. A diferencia de la ficha
// tecnica (imagenes), cada cotizacion guarda ademas su valor y su fecha (no
// solo el PDF), para poder calcular el promedio de las que tengan <=90 dias.

function QuotationPicker({ quotations, onAdd, onRemove, onValueChange, onDateChange, max, error }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type === "application/pdf");
    if (files.length < e.target.files.length) {
      sileo.error({
        title: "Formato no permitido",
        description: "Las cotizaciones solo se aceptan en formato PDF",
      });
    }
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-semibold text-black">
        Cotizaciones <span className="font-normal text-neutral-400">(obligatorio, 1 a {max}; valor y fecha de cada una)</span>
      </p>

      <div className="flex flex-col gap-2">
        {quotations.map((quotation, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border bg-neutral-50 p-2">
            <FileText size={18} className="shrink-0 text-red-600" />
            <a href={quotation.url} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
              Ver PDF {index + 1}
            </a>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor cotizado"
              value={quotation.value}
              onChange={(e) => onValueChange(index, e.target.value)}
              className="h-8 w-32 rounded border border-black/20 px-2 text-caption text-black"
            />
            <input
              type="date"
              value={quotation.date}
              onChange={(e) => onDateChange(index, e.target.value)}
              className="h-8 rounded border border-black/20 px-2 text-caption text-black"
            />
            <button
              type="button"
              aria-label="Quitar cotización"
              onClick={() => onRemove(index)}
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/60 text-white"
            >            
              <X size={12} />
            </button>
          </div>
        ))}

        {quotations.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Agregar cotización"
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950) text-black cursor-pointer transition-colors hover:bg-black/5"
          >
            <Upload size={18} />
            <span className="text-caption">Subir PDF</span>
          </button>
        )}
      </div>

      {error && <p className="text-caption text-red-800">{error}</p>}

      <input ref={inputRef} type="file" accept="application/pdf" multiple={max > 1} hidden onChange={handleChange} />
    </div>
  );
}

export default function MaterialRegisterForm({
  materialId = null,
  nextTo = "/dashboard/materiales",
  cancelTo = "/dashboard/materiales",
  showBackButton = false,
  backTo = "/dashboard/materiales",
  fixedType = null,
}) {
  const isEditing = Boolean(materialId);
  const lockType = Boolean(fixedType) && !isEditing;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const [materialTypes, setMaterialTypes] = useState([]);

  const [formData, setFormData] = useState({
    materialName: "",
    materialType: lockType ? fixedType : "",
    materialQuantity: "",
    materialDescription: "",
    isActive: true,
    senaPlate: "",
    marca: "",
    custodian: "",
    inventario: "",
    location: "",
    purchaseDate: "",
    unitValue: "",
    model: "",
    category: "",
    externalId: "",
  });

  const isConsumo = formData.materialType === "Consumo";
  const isDevolutivo = formData.materialType === "Devolutivo";
  const showExtendedFields = isConsumo || isDevolutivo;
  const maxTechnicalSheets = isDevolutivo ? 3 : 1;
  // Un consumo con placa SENA se controla como unidad individual: la
  // cantidad queda fija en 1 y el campo se bloquea para evitar cambiarla.
  const quantityLockedBySenaPlate = isConsumo && Boolean(formData.senaPlate.trim());

  const steps = showExtendedFields ? EXTENDED_STEPS : SIMPLE_STEPS;
  const stepFieldsList = showExtendedFields ? EXTENDED_STEP_FIELDS : SIMPLE_STEP_FIELDS;

  const [imagePreviews, setImagePreviews] = useState([]);
  const [technicalSheetPreviews, setTechnicalSheetPreviews] = useState([]);
  const [quotationPreviews, setQuotationPreviews] = useState([]);

  useEffect(() => {
    getMaterialTypes().then(setMaterialTypes);
  }, []);

  const [marcas, setMarcas] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!showExtendedFields) return;
    getMarcas().then(setMarcas).catch(console.error);
    getInventarios().then(setInventarios).catch(console.error);
    if (isConsumo) getUsers().then(setUsers).catch(console.error);
  }, [showExtendedFields, isConsumo]);

  const marcaOptions = useMemo(
    () => [{ id: "", label: "Selecciona una marca" }, ...marcas.map((marca) => ({ id: String(marca.id), label: marca.name }))],
    [marcas],
  );

  const inventarioOptions = useMemo(
    () => [{ id: "", label: "Selecciona un inventario" }, ...inventarios.map((inv) => ({ id: String(inv.id), label: inv.name }))],
    [inventarios],
  );

  // Solo se puede elegir como cuentadante a un usuario marcado como tal en su registro (checkbox "Es cuentadante").
  const custodianOptions = useMemo(
    () => [
      { id: "", label: "Selecciona un cuentadante" },
      ...users.filter((user) => user.is_custodian).map((user) => ({ id: String(user.id), label: formatUserName(user) })),
    ],
    [users],
  );

  const categoryOptions = useMemo(
    () => [{ id: "", label: "Selecciona una categoría" }, ...MATERIAL_CATEGORY_OPTIONS],
    [],
  );

  // Precarga los datos del material desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getMaterialById(materialId)
      .then((material) => {
        setFormData({
          materialName: material.name ?? "",
          materialType: material.type ?? "",
          materialQuantity: material.quantity ?? "",
          materialDescription: material.description ?? "",
          isActive: material.is_active ?? true,
          senaPlate: material.sena_plate ?? "",
          marca: material.marca_id ? String(material.marca_id) : "",
          custodian: material.custodian_id ? String(material.custodian_id) : "",
          inventario: material.inventario_id ? String(material.inventario_id) : "",
          location: material.location ?? "",
          purchaseDate: material.purchase_date ? String(material.purchase_date).slice(0, 10) : "",
          unitValue: material.unit_value ?? "",
          model: material.model ?? "",
          category: material.category ?? "",
          externalId: material.external_id ?? "",
        });
        setImagePreviews(material.image_urls ?? []);
        setTechnicalSheetPreviews(material.technical_sheet_urls ?? []);
        setQuotationPreviews(
          Array.isArray(material.quotations)
            ? material.quotations.map((q) => ({
              url: q.url ?? "",
              value: q.value !== null && q.value !== undefined ? String(q.value) : "",
              date: q.date ?? "",
            }))
          : [],
        );
      })
      .catch((err) => {
        sileo.error({
          title: "Material no encontrado",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, materialId]);

  const MAX_IMAGES = 3;

  const handleAddImages = (files) => {
    const remaining = MAX_IMAGES - imagePreviews.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews((current) => [...current, reader.result].slice(0, MAX_IMAGES));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTechnicalSheets = (files) => {
    const remaining = maxTechnicalSheets - technicalSheetPreviews.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setTechnicalSheetPreviews((current) => [...current, reader.result].slice(0, maxTechnicalSheets));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveTechnicalSheet = (index) => {
    setTechnicalSheetPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const MAX_QUOTATIONS = 3;

  const handleAddQuotations = (files) => {
    const remaining = MAX_QUOTATIONS - quotationPreviews.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setQuotationPreviews((current) => [...current, { url: reader.result, value: "", date: "" }].slice(0, MAX_QUOTATIONS));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveQuotation = (index) => {
    setQuotationPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuotationValueChange = (index, value) => {
    setQuotationPreviews((prev) => prev.map((q, i) => (i === index ? { ...q, value } : q)));
  };

  const handleQuotationDateChange = (index, date) => {
    setQuotationPreviews((prev) => prev.map((q, i) => (i === index ? { ...q, date } : q)));
  };

  // Promedio de las cotizaciones vigentes: solo las que tengan valor y fecha
  // validos y no superen los 90 dias de antiguedad, tomando como maximo las
  // MAX_QUOTATIONS mas recientes de ellas.
  const quotationAverage = useMemo(() => {
    const now = Date.now();
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    const valid = quotationPreviews
      .filter((q) => q.date && q.value !== "" && !Number.isNaN(Number(q.value)))
      .filter((q) => {
        const quotedAt = new Date(q.date).getTime();
        return !Number.isNaN(quotedAt) && now - quotedAt <= NINETY_DAYS_MS;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, MAX_QUOTATIONS);

    if (valid.length === 0) return null;

    const sum = valid.reduce((acc, q) => acc + Number(q.value), 0);
    return sum / valid.length;
  }, [quotationPreviews]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };

      // Un material de consumo con placa SENA se controla como una unidad
      // individual: la cantidad queda fija en 1 mientras tenga placa.
      if (name === "senaPlate" && prev.materialType === "Consumo" && value.trim()) {
        next.materialQuantity = "1";
      }

      return next;
    });

    // Cambiar el tipo de material puede cambiar por completo el numero de
    // pasos del recorrido (simple <-> consumo/devolutivo), asi que volvemos
    // siempre al primer paso para evitar quedar en un paso que ya no existe.
    if (name === "materialType") setCurrentStep(0);
  };

  const computedTotalValue = (Number(formData.materialQuantity) || 0) * (Number(formData.unitValue) || 0);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () =>
    materialSchema.safeParse({
      ...formData,
      materialImages: imagePreviews,
      technicalSheetImages: technicalSheetPreviews,
      quotations: quotationPreviews,
    });

  const goBack = () => setCurrentStep((step) => Math.max(0, step - 1));

  const goNext = () => {
    const result = validate();
    const stepFields = stepFieldsList[currentStep] ?? [];

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
      const firstErrorStep = stepFieldsList.findIndex((fields) =>
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
        name: result.data.materialName,
        type: result.data.materialType,
        quantity: result.data.materialQuantity,
        description: result.data.materialDescription,
        isActive: result.data.isActive,
        imageUrls: imagePreviews,
        technicalSheetUrls: technicalSheetPreviews,
        quotations: quotationPreviews,
        senaPlate: result.data.senaPlate,
        marca: result.data.marca,
        custodian: result.data.custodian,
        inventario: result.data.inventario,
        location: result.data.location,
        purchaseDate: result.data.purchaseDate,
        unitValue: result.data.unitValue,
        model: result.data.model,
        category: result.data.category,
        externalId: result.data.externalId,
      };

      if (isEditing) {
        await updateMaterial(materialId, payload);
        sileo.success({
          title: "Material actualizado",
          description: `${result.data.materialName} se actualizó correctamente`,
        });
      } else {
        const res = await createMaterial(payload);
        sileo.success({
          title: "Material creado",
          description: res?.message ?? "Material creado correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar material",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClass = "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm";
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

        <div className={`mx-auto w-full ${showExtendedFields ? "max-w-7xl" : "max-w-5xl"}`}>
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar material" : "Nuevo material"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información del material
          </p>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            {showExtendedFields ? (
              <>
                {currentStep === 0 && (
                  <div className={cardClass}>
                    <h2 className="mb-4 text-base font-semibold">Información General</h2>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-4">
                          <ImagePicker
                            previews={imagePreviews}
                            onAdd={handleAddImages}
                            onRemove={handleRemoveImage}
                            max={MAX_IMAGES}
                          />

                        <TechnicalSheetPicker
                          previews={technicalSheetPreviews}
                          onAdd={handleAddTechnicalSheets}
                          onRemove={handleRemoveTechnicalSheet}
                          max={maxTechnicalSheets}
                          required={isConsumo}
                          error={errors.technicalSheetImages}
                        />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input
                          label="Nombre"
                          required
                          dense
                          labelClassName={bigLabelClass}
                          name="materialName"
                          placeholder="Nombre del material"
                          startAdornment={<Package size={16} />}
                          value={formData.materialName}
                          onChange={handleChange}
                          error={errors.materialName}
                        />

                        {isDevolutivo && (
                          <Input
                            label="Modelo"
                            required
                            dense
                            labelClassName={bigLabelClass}
                            name="model"
                            placeholder="Modelo"
                            startAdornment={<Fingerprint size={16} />}
                            value={formData.model}
                            onChange={handleChange}
                            error={errors.model}
                          />
                        )}

                        <Input
                          label="Placa SENA (opcional)"
                          dense
                          labelClassName={bigLabelClass}
                          name="senaPlate"
                          placeholder="Ej. SENA-00123"
                          startAdornment={<Tag size={16} />}
                          value={formData.senaPlate}
                          onChange={handleChange}
                          error={errors.senaPlate}
                        />

                        {isDevolutivo && (
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
                        )}

                        {isDevolutivo && (
                          <Input
                            label="Serial SN (opcional)"
                            dense
                            labelClassName={bigLabelClass}
                            name="externalId"
                            placeholder="Identificador interno"
                            startAdornment={<Hash size={16} />}
                            value={formData.externalId}
                            onChange={handleChange}
                            error={errors.externalId}
                          />
                        )}

                        <Select
                          label="Marca"
                          required
                          dense
                          labelClassName={bigLabelClass}
                          name="marca"
                          options={marcaOptions}
                          value={formData.marca}
                          onChange={handleChange}
                          error={errors.marca}
                        />


                        <Select
                          label="Inventario (opcional)"
                          dense
                          labelClassName={bigLabelClass}
                          name="inventario"
                          options={inventarioOptions}
                          value={formData.inventario}
                          onChange={handleChange}
                          error={errors.inventario}
                        />

                        {isConsumo && (
                          <Select
                            label="Cuentadante"
                            required
                            dense
                            labelClassName={bigLabelClass}
                            name="custodian"
                            startAdornment={<UserCog size={16} />}
                            options={custodianOptions}
                            value={formData.custodian}
                            onChange={handleChange}
                            error={errors.custodian}
                          />
                        )}

                        <div className="sm:col-span-2 lg:col-span-4">
                          <Input
                            label="Descripción"
                            required
                            dense
                            labelClassName={bigLabelClass}
                            name="materialDescription"
                            placeholder="Describe el material"
                            startAdornment={<FileText size={16} />}
                            value={formData.materialDescription}
                            onChange={handleChange}
                            error={errors.materialDescription}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <QuotationPicker 
                        quotations={quotationPreviews}
                        onAdd={handleAddQuotations}
                        onRemove={handleRemoveQuotation}
                        onValueChange={handleQuotationValueChange}
                        onDateChange={handleQuotationDateChange}
                        max={MAX_QUOTATIONS}
                        error={errors.quotations}
                      />
                      {quotationAverage !== null && (
                        <p className="mt-2 text-sm text-black">
                          Promedio de cotizaciones vigentes (≤90 días):{" "}
                          <span className="font-semibold">{currencyFormatter.format(quotationAverage)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className={cardClass}>
                    <h2 className="mb-4 text-base font-semibold">Inventario</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Input
                        label={quantityLockedBySenaPlate ? "Cantidad (fija en 1 por placa SENA)" : "Cantidad"}
                        required
                        dense
                        disabled={quantityLockedBySenaPlate}
                        labelClassName={bigLabelClass}
                        name="materialQuantity"
                        placeholder="Cantidad"
                        type="number"
                        min="1"
                        startAdornment={<Hash size={16} />}
                        value={formData.materialQuantity}
                        onChange={handleChange}
                        error={errors.materialQuantity}
                      />

                      <Input
                        label="Ubicación (opcional)"
                        dense
                        labelClassName={bigLabelClass}
                        name="location"
                        placeholder="Ej. Bodega 2"
                        startAdornment={<MapPin size={16} />}
                        value={formData.location}
                        onChange={handleChange}
                        error={errors.location}
                      />

                      <Input
                        label="Fecha compra"
                        required
                        dense
                        labelClassName={bigLabelClass}
                        name="purchaseDate"
                        type="date"
                        startAdornment={<CalendarDays size={16} />}
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        error={errors.purchaseDate}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className={cardClass}>
                    <h2 className="mb-4 text-base font-semibold">Valores</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Valor unitario"
                        required
                        dense
                        labelClassName={bigLabelClass}
                        name="unitValue"
                        placeholder="0"
                        type="number"
                        min="0"
                        step="0.01"
                        startAdornment={<DollarSign size={16} />}
                        value={formData.unitValue}
                        onChange={handleChange}
                        error={errors.unitValue}
                      />

                      <Input
                        label="Valor Total"
                        dense
                        labelClassName={bigLabelClass}
                        disabled
                        startAdornment={<DollarSign size={16} />}
                        value={currencyFormatter.format(computedTotalValue)}
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {currentStep === 0 && (
                  <div className={cardClass}>
                    <h2 className="mb-4 text-base font-semibold">Información General</h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
                      <ImagePicker 
                        previews={imagePreviews}
                        onAdd={handleAddImages}
                        onRemove={handleRemoveImage}
                        max={MAX_IMAGES}
                      />

                      <div className={`grid grid-cols-1 gap-4 ${lockType ? "" : "sm:grid-cols-2"}`}>
                        <Input
                          label="Nombre"
                          required
                          dense
                          labelClassName={bigLabelClass}
                          name="materialName"
                          placeholder="Ingrese el nombre del material"
                          startAdornment={<Package size={16} />}
                          value={formData.materialName}
                          onChange={handleChange}
                          error={errors.materialName}
                        />

                        {!lockType && (
                          <Select
                            label="Tipo de material"
                            required
                            dense
                            labelClassName={bigLabelClass}
                            name="materialType"
                            options={materialTypes}
                            value={formData.materialType}
                            onChange={handleChange}
                            error={errors.materialType}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className={cardClass}>
                    <h2 className="mb-4 text-base font-semibold">Detalles adicionales</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Cantidad"
                        required
                        dense
                        labelClassName={bigLabelClass}
                        name="materialQuantity"
                        placeholder="Ingrese la cantidad"
                        type="number"
                        min="1"
                        startAdornment={<Hash size={16} />}
                        value={formData.materialQuantity}
                        onChange={handleChange}
                        error={errors.materialQuantity}
                      />

                      <Input
                        label="Descripción (opcional)"
                        dense
                        labelClassName={bigLabelClass}
                        name="materialDescription"
                        placeholder="Ingrese una descripción"
                        startAdornment={<FileText size={16} />}
                        value={formData.materialDescription}
                        onChange={handleChange}
                        error={errors.materialDescription}
                      />
                    </div>
                  </div>
                )}
              </>
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
                  {isSubmitting ? "Guardando..." : isEditing ? "Guardar material" : "Crear"}
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