import { useState, useEffect, useRef } from "react";
import { cotizacionSchema } from "../schemas/cotizacionSchema";
import { createCotizacion, updateCotizacion, getCotizacionById } from "../services/cotizacionService";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import { MoveLeft, FileText, CalendarDays, Upload, Check } from "lucide-react";
import { sileo } from "sileo";

export default function CotizacionRegisterForm({
  cotizacionId = null,
  nextTo = "/dashboard/cotizaciones",
  cancelTo = "/dashboard/cotizaciones",
  showBackButton = false,
  backTo = "/dashboard/cotizaciones",
}) {
  const isEditing = Boolean(cotizacionId);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ name: "", quotationDate: "" });
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  // Precarga los datos de la cotizacion desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getCotizacionById(cotizacionId)
      .then((cotizacion) => {
        setFormData({
          name: cotizacion.name ?? "",
          quotationDate: cotizacion.quotation_date ? String(cotizacion.quotation_date).slice(0, 10) : "",
        });
        setFileUrl(cotizacion.file_url ?? "");
      })
      .catch((err) => {
        sileo.error({
          title: "Cotización no encontrada",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, cotizacionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      sileo.error({ title: "Archivo inválido", description: "Solo se permiten archivos PDF" });
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = cotizacionSchema.safeParse({ ...formData, fileUrl });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateCotizacion(cotizacionId, result.data);
        sileo.success({
          title: "Cotización actualizada",
          description: `${result.data.name} se actualizó correctamente`,
        });
      } else {
        const res = await createCotizacion(result.data);
        sileo.success({
          title: "Cotización creada",
          description: res?.message ?? "Cotización creada correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar la cotización",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_span]:text-black">
        {showBackButton && (
          <div className="mb-4">
            <IconButton ariaLabel="Volver" variant="ghost" onClick={() => navigate(backTo)}>
              <MoveLeft />
            </IconButton>
          </div>
        )}

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar cotización" : "Nueva cotización"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información de la cotización
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200 sm:bg-white sm:p-6 sm:shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Información General</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="name"
                  placeholder="Ej. Cotización Lenovo Octubre"
                  startAdornment={<FileText size={16} />}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                <Input
                  label="Fecha de la cotización"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="quotationDate"
                  type="date"
                  startAdornment={<CalendarDays size={16} />}
                  value={formData.quotationDate}
                  onChange={handleChange}
                  error={errors.quotationDate}
                />
              </div>

              <div className="mt-4">
                <p className={`mb-1 ${errors.fileUrl ? "text-red-800" : "text-text-secondary"} text-caption`}>
                  Archivo PDF <span className="text-red-600">*</span>
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-(--primary-950) text-black transition-colors hover:bg-black/5"
                  >
                    <Upload size={18} />
                    <span className="text-caption">Subir PDF</span>
                  </button>

                  {fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
                      {fileName || "Ver PDF actual"}
                    </a>
                  )}

                  <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
                </div>
                {errors.fileUrl && <p className="mt-1 text-caption text-red-800">{errors.fileUrl}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" type="button" onClick={() => navigate(cancelTo)}>
                Cancelar
              </Button>

              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                <Check size={16} />
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar cotización" : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
