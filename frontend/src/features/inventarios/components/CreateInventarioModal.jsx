// Popup para crear un inventario sin salir del formulario donde se esta
// seleccionando (ej. al registrar un material). Al guardar, el inventario
// nuevo queda seleccionado automaticamente en ese formulario.
import { useState } from "react";
import { X, Boxes, Check } from "lucide-react";
import { Button, Input, bigLabelClass } from "@/shared";
import { inventarioSchema } from "../schemas/inventarioSchema";
import { createInventario } from "../services/inventarioService";
import { sileo } from "sileo";

export default function CreateInventarioModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = inventarioSchema.safeParse({ name });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await createInventario(result.data);
      sileo.success({ title: "Inventario creado", description: result.data.name });
      onCreated({ id: res.inventarioId, name: result.data.name });
      setName("");
    } catch (err) {
      setError(err?.message || "Error al crear el inventario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-900">Nuevo inventario</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleClose}
            className="cursor-pointer rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Input
            label="Nombre"
            required
            dense
            labelClassName={bigLabelClass}
            name="name"
            placeholder="Ingrese el nombre del inventario"
            startAdornment={<Boxes size={16} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2">
              <Check size={16} />
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
