import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { devolucionSchema } from "../schemas/devolucionSchema";
import { createDevolucion } from "../services/devolucionService";
import { getPrestamos } from "@/features/prestamos/services/prestamoService";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { Input, Button, Select, IconButton } from "@/shared";
import DevolucionMaterialesModal from "./DevolucionMaterialesModal";
import { MoveLeft, Undo2, User, FileText, Pencil, Check } from "lucide-react";
import { sileo } from "sileo";

export default function DevolucionRegisterForm({
  nextTo = "/dashboard/prestamos",
  cancelTo = "/dashboard/prestamos",
  showBackButton = false,
  backTo = "/dashboard/prestamos",
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPrestamoId = searchParams.get("prestamoId") ?? "";

  const [prestamos, setPrestamos] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getPrestamos().then(setPrestamos).catch(console.error);
    getUsers().then(setUsers).catch(console.error);
  }, []);

  // Solo se pueden devolver prestamos que aun no tengan devolucion registrada.
  const activePrestamos = useMemo(() => prestamos.filter((p) => !p.returned_at), [prestamos]);

  const prestamoOptions = useMemo(
    () => [
      { id: "", label: "Selecciona el préstamo a devolver" },
      ...activePrestamos.map((p) => ({
        id: String(p.id),
        label: `${(p.materials ?? []).map((m) => m.name).join(", ") || `Préstamo #${p.id}`}${p.ficha ? ` — Ficha ${p.ficha}` : ""}`,
      })),
    ],
    [activePrestamos],
  );

  const userOptions = useMemo(
    () => [{ id: "", label: "Selecciona un usuario" }, ...users.map((user) => ({ id: String(user.id), label: formatUserName(user) }))],
    [users],
  );

  const [formData, setFormData] = useState({
    prestamoId: preselectedPrestamoId,
    returnedBy: "",
    observation: "",
  });
  const [materialsDetail, setMaterialsDetail] = useState([]);

  const selectedPrestamo = useMemo(
    () => activePrestamos.find((p) => String(p.id) === formData.prestamoId) ?? null,
    [activePrestamos, formData.prestamoId],
  );

  // Al elegir (o precargar via ?prestamoId=, una vez que la lista de
  // prestamos termine de cargar) un prestamo, arma la tabla de materiales y
  // sugiere como "devuelto por" a quien lo solicito, sin impedir que se
  // cambie por otra persona. Se ajusta durante el render (no en un efecto)
  // comparando contra el ultimo prestamo aplicado, ya que selectedPrestamo
  // pasa de null a un valor real cuando termina de cargar la lista aunque
  // formData.prestamoId no cambie.
  const [lastAppliedPrestamoId, setLastAppliedPrestamoId] = useState(null);
  const resolvedPrestamoId = selectedPrestamo?.id ?? null;
  if (resolvedPrestamoId !== lastAppliedPrestamoId) {
    setLastAppliedPrestamoId(resolvedPrestamoId);
    if (selectedPrestamo) {
      setMaterialsDetail(
        (selectedPrestamo.materials ?? []).map((material) => ({
          materialId: String(material.id),
          materialName: material.name,
          materialQuantity: material.quantity ?? 0,
          quantityReturned: material.quantity ?? 0,
          condition: "",
        })),
      );
      setFormData((prev) => ({
        ...prev,
        returnedBy: prev.returnedBy || (selectedPrestamo.requesting_user ? String(selectedPrestamo.requesting_user) : ""),
      }));
    } else {
      setMaterialsDetail([]);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = devolucionSchema.safeParse({ ...formData, materials: materialsDetail });

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
      const res = await createDevolucion(result.data.prestamoId, {
        returnedBy: result.data.returnedBy,
        observation: result.data.observation,
        materials: result.data.materials.map((material) => ({
          materialId: material.materialId,
          quantityReturned: material.quantityReturned,
          condition: material.condition,
        })),
      });
      sileo.success({
        title: "Devolución registrada",
        description: res?.message ?? "La devolución se registró correctamente",
      });
      navigate(nextTo);
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al registrar la devolución",
        description: err?.message || String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const materialsSummary =
    materialsDetail.length > 0
      ? materialsDetail.map((material) => material.materialName).join(", ")
      : "Selecciona un préstamo para ver sus materiales";

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

        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-1 text-center text-2xl font-semibold">Registrar devolución</h1>
          <p className="mb-6 text-center text-sm text-black">
            El ID de la devolución es el mismo del préstamo que le da origen
          </p>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Préstamo a devolver</h2>

              <div className="grid grid-cols-1 gap-4">
                <Select
                  label="Material(es) prestado(s)"
                  required
                  name="prestamoId"
                  startAdornment={<Undo2 size={16} />}
                  options={prestamoOptions}
                  value={formData.prestamoId}
                  onChange={handleChange}
                  error={errors.prestamoId}
                />

                {selectedPrestamo && (
                  <div className="flex flex-col gap-2 rounded-lg border border-dashed border-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{materialsSummary}</p>
                      <p className="text-caption text-neutral-500">
                        {materialsDetail.filter((material) => material.condition).length} de {materialsDetail.length} material(es) con estado registrado
                      </p>
                    </div>
                    <Button type="button" variant="secondary" className="w-fit gap-2" onClick={() => setIsModalOpen(true)}>
                      <Pencil size={16} />
                      Completar materiales
                    </Button>
                  </div>
                )}

                {errors.materials && <p className="text-caption text-red-800">{errors.materials}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Detalle de la devolución</h2>

              <Select
                label="Devuelto por"
                required
                name="returnedBy"
                startAdornment={<User size={16} />}
                options={userOptions}
                value={formData.returnedBy}
                onChange={handleChange}
                error={errors.returnedBy}
              />
              <p className="mt-1 text-caption text-neutral-500">
                Por lo general es la misma persona que solicitó el préstamo.
              </p>

              <div className="mt-4">
                <Input
                  label="Observación (opcional)"
                  name="observation"
                  placeholder="Notas sobre el estado de los materiales devueltos"
                  startAdornment={<FileText size={16} />}
                  value={formData.observation}
                  onChange={handleChange}
                  error={errors.observation}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="secondary" type="button" onClick={() => navigate(cancelTo)}>
                Cancelar
              </Button>

              <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2 rounded-full">
                <Check size={16} />
                {isSubmitting ? "Guardando..." : "Registrar devolución"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <DevolucionMaterialesModal
          materials={materialsDetail}
          onClose={() => setIsModalOpen(false)}
          onSave={setMaterialsDetail}
        />
      )}
    </div>
  );
}