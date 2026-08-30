import { useState, useEffect } from "react";
import { marcaSchema } from "../schemas/marcaSchema";
import { createMarca, updateMarca, getMarcaById } from "../services/marcaService";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Tag, FileText, Check } from "lucide-react";
import { sileo } from "sileo";

export default function MarcaRegisterForm({
  marcaId = null,
  nextTo = "/dashboard/marcas",
  cancelTo = "/dashboard/marcas",
  showBackButton = false,
  backTo = "/dashboard/marcas",
}) {
  const isEditing = Boolean(marcaId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Precarga los datos de la marca desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getMarcaById(marcaId)
      .then((marca) => {
        setFormData({
          name: marca.name ?? "",
          description: marca.description ?? "",
        });
      })
      .catch((err) => {
        sileo.error({
          title: "Marca no encontrada",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, marcaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = marcaSchema.safeParse(formData);

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
        await updateMarca(marcaId, result.data);
        sileo.success({
          title: "Marca actualizada",
          description: `${result.data.name} se actualizó correctamente`,
        });
      } else {
        const res = await createMarca(result.data);
        sileo.success({
          title: "Marca creada",
          description: res?.message ?? "Marca creada correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar la marca",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar marca" : "Nueva marca"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información de la marca
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Información General</h2>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nombre"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="name"
                  placeholder="Ingrese el nombre de la marca"
                  startAdornment={<Tag size={16} />}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
                <Input
                  label="Descripción (opcional)"
                  dense
                  labelClassName={bigLabelClass}
                  name="description"
                  placeholder="Ingrese una descripción"
                  startAdornment={<FileText size={16} />}
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" type="button" onClick={() => navigate(cancelTo)}>
                Cancelar
              </Button>

              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                <Check size={16} />
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar marca" : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}