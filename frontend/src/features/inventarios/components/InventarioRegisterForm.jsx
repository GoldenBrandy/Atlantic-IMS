// Formulario de registro/edicion de inventarios. Solo tiene 1 campo
// (nombre), igual de simple que MarcaRegisterForm.
import { useState, useEffect } from "react";
import { inventarioSchema } from "../schemas/inventarioSchema";
import { createInventario, updateInventario, getInventarioById } from "../services/inventarioService";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Boxes, Check } from "lucide-react";
import { sileo } from "sileo";

export default function InventarioRegisterForm({
  inventarioId = null,
  nextTo = "/dashboard/inventarios",
  cancelTo = "/dashboard/inventarios",
  showBackButton = false,
  backTo = "/dashboard/inventarios",
}) {
  const isEditing = Boolean(inventarioId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (!isEditing) return;
    getInventarioById(inventarioId)
      .then((inventario) => {
        setFormData({ name: inventario.name ?? "" });
      })
      .catch((err) => {
        sileo.error({
          title: "Inventario no encontrado",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, inventarioId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = inventarioSchema.safeParse(formData);

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
        await updateInventario(inventarioId, result.data);
        sileo.success({
          title: "Inventario actualizado",
          description: `${result.data.name} se actualizó correctamente`,
        });
      } else {
        const res = await createInventario(result.data);
        sileo.success({
          title: "Inventario creado",
          description: res?.message ?? "Inventario creado correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar el inventario",
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
            {isEditing ? "Editar inventario" : "Nuevo inventario"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            Completa la información del inventario
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Información general</h2>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nombre"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="name"
                  placeholder="Ingrese el nombre del inventario"
                  startAdornment={<Boxes size={16} />}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" type="button" onClick={() => navigate(cancelTo)}>
                Cancelar
              </Button>

              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                <Check size={16} />
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar inventario" : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
