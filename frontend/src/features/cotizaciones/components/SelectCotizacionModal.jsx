// Popup reutilizable para elegir una cotizacion ya guardada, o subir una
// nueva desde la computadora si todavia no existe (quedando disponible
// tambien para la proxima vez, igual que CreateInventarioModal).
import { useState, useEffect, useRef } from "react";
import { X, FileText, Upload, Check, Plus } from "lucide-react";
import { Button, Input, bigLabelClass } from "@/shared";
import { cotizacionSchema } from "../schemas/cotizacionSchema";
import { getCotizaciones, createCotizacion } from "../services/cotizacionService";
import { sileo } from "sileo";

export default function SelectCotizacionModal({ isOpen, onClose, excludeIds = [], onSelect }) {
  const [mode, setMode] = useState("list");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", quotationDate: "" });
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setMode("list");
    setFormData({ name: "", quotationDate: "" });
    setFileUrl("");
    setFileName("");
    setErrors({});
    setIsLoading(true);
    getCotizaciones()
      .then(setCotizaciones)
      .catch((err) => {
        sileo.error({ title: "No se pudieron cargar las cotizaciones", description: err?.message || String(err) });
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const availableCotizaciones = cotizaciones.filter(
    (c) => c.status === "activo" && !excludeIds.includes(String(c.id)),
  );

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

  const handleCreateSubmit = async (e) => {
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
      const res = await createCotizacion(result.data);
      sileo.success({ title: "Cotización creada", description: result.data.name });
      onSelect({
        id: res.cotizacionId,
        name: result.data.name,
        file_url: result.data.fileUrl,
        quotation_date: result.data.quotationDate,
      });
    } catch (err) {
      sileo.error({ title: "Error al crear la cotización", description: err?.message || String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {mode === "list" ? "Seleccionar cotización" : "Nueva cotización"}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        {mode === "list" ? (
          <>
            <button
              type="button"
              onClick={() => setMode("create")}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-(--primary-950) py-3 text-caption font-medium text-(--primary-950) transition-colors hover:bg-black/5"
            >
              <Plus size={16} />
              Subir nueva cotización
            </button>

            {isLoading ? (
              <p className="text-center text-caption text-neutral-500">Cargando...</p>
            ) : availableCotizaciones.length === 0 ? (
              <p className="text-center text-caption text-neutral-500">No hay cotizaciones guardadas todavía</p>
            ) : (
              <div className="flex flex-col gap-1">
                {availableCotizaciones.map((cotizacion) => (
                  <button
                    key={cotizacion.id}
                    type="button"
                    onClick={() => onSelect(cotizacion)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-caption transition-colors hover:bg-neutral-100"
                  >
                    <FileText size={16} className="shrink-0 text-red-600" />
                    <span className="flex-1 truncate">{cotizacion.name}</span>
                    {cotizacion.quotation_date && (
                      <span className="shrink-0 text-neutral-400">{String(cotizacion.quotation_date).slice(0, 10)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4" noValidate autoComplete="off">
            <Input
              label="Nombre"
              required
              dense
              labelClassName={bigLabelClass}
              name="name"
              placeholder="Ej. Cotización Lenovo Octubre"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              error={errors.name}
            />

            <Input
              label="Fecha de la cotización"
              required
              dense
              labelClassName={bigLabelClass}
              name="quotationDate"
              type="date"
              value={formData.quotationDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, quotationDate: e.target.value }))}
              error={errors.quotationDate}
            />

            <div>
              <p className={`mb-1 text-caption ${errors.fileUrl ? "text-red-800" : "text-text-secondary"}`}>
                Archivo PDF <span className="text-red-600">*</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-(--primary-950) text-black transition-colors hover:bg-black/5"
                >
                  <Upload size={16} />
                </button>
                {fileName && <span className="text-caption text-neutral-600">{fileName}</span>}
                <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
              </div>
              {errors.fileUrl && <p className="mt-1 text-caption text-red-800">{errors.fileUrl}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setMode("list")} disabled={isSubmitting}>
                Volver
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2">
                <Check size={16} />
                {isSubmitting ? "Creando..." : "Crear y seleccionar"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
