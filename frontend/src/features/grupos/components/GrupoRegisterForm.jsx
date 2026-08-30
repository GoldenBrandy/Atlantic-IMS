import { useState, useEffect } from "react";
import { grupoSchema } from "../schemas/grupoSchema";
import { createGrupo, updateGrupo, getGrupoById } from "../services/grupoService";
import { Input, Button, IconButton, bigLabelClass } from "@/shared";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Tag, Hash, FileText, Check } from "lucide-react";
import { sileo } from "sileo";

export default function GrupoRegisterForm({
  grupoId = null,
  nextTo = "/dashboard/grupos",
  cancelTo = "/dashboard/grupos",
  showBackButton = false,
  backTo = "/dashboard/grupos",
}) {
  const isEditing = Boolean(grupoId);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
  });
  const [groupCode, setGroupCode] = useState("");

  // Precarga los datos del grupo desde la API cuando se esta editando.
  useEffect(() => {
    if (!isEditing) return;
    getGrupoById(grupoId)
      .then((grupo) => {
        setFormData({
          groupName: grupo.group_name ?? "",
          description: grupo.description ?? "",
        });
        setGroupCode(grupo.group_code ?? "");
      })
      .catch((err) => {
        sileo.error({
          title: "Grupo no encontrado",
          description: err?.message || String(err),
        });
      });
  }, [isEditing, grupoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = grupoSchema.safeParse(formData);

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
      const payload = {
        name: result.data.groupName,
        description: result.data.description,
      };

      if (isEditing) {
        await updateGrupo(grupoId, payload);
        sileo.success({
          title: "Grupo actualizado",
          description: `${result.data.groupName} se actualizó correctamente`,
        });
      } else {
        const res = await createGrupo(payload);
        sileo.success({
          title: "Grupo creado",
          description: res?.message ?? "Grupo creado correctamente",
        });
      }
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al guardar el grupo",
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

        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">
            {isEditing ? "Editar grupo" : "Nuevo grupo"}
          </h1>
          <p className="mb-6 text-center text-sm text-black">
            {isEditing
              ? "Actualiza la información del grupo"
              : "Los grupos funcionan como roles del sistema (ej. ADMIN, INSTR, APREN). Sus permisos se asignan en Gestión de Permisos."}
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Información general</h2>

              <div className={`grid grid-cols-1 gap-4 ${isEditing ? "sm:grid-cols-2" : ""}`}>
                <Input
                  label="Nombre del grupo"
                  required
                  dense
                  labelClassName={bigLabelClass}
                  name="groupName"
                  placeholder="Ej. Administrador, Instructor..."
                  startAdornment={<Tag size={16} />}
                  value={formData.groupName}
                  onChange={handleChange}
                  error={errors.groupName}
                />

                {isEditing && (
                  <Input
                    label="Código (generado automáticamente)"
                    disabled
                    readOnly
                    dense
                    labelClassName={bigLabelClass}
                    startAdornment={<Hash size={16} />}
                    value={groupCode}
                  />
                )}

                <div className="sm:col-span-2">
                  <Input
                    label="Descripción (opcional)"
                    dense
                    labelClassName={bigLabelClass}
                    name="description"
                    placeholder="Descripción del grupo"
                    startAdornment={<FileText size={16} />}
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(cancelTo)}
              >
                Cancelar
              </Button>

              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                <Check size={16} />
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar grupo" : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}