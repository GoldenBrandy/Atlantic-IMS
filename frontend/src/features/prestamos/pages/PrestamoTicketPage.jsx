// Pantalla que se muestra obligatoriamente justo despues de crear un
// prestamo (ver PrestamoRegisterForm.jsx): el ticket/comprobante completo,
// con los participantes, materiales, fechas y la firma digital.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared";
import { Ticket } from "lucide-react";
import { sileo } from "sileo";
import { getPrestamoById } from "../services/prestamoService";
import { getUsers } from "@/features/users/services/userService";
import { buildTicketFields } from "../services/prestamoTicket";

export default function PrestamoTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestamo, setPrestamo] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    getPrestamoById(id)
      .then(setPrestamo)
      .catch((err) => {
        sileo.error({ title: "No se pudo cargar el ticket", description: err?.message || String(err) });
        navigate("/dashboard/prestamos", { replace: true });
      });
  }, [id, navigate]);

  if (!prestamo) return null;

  const fields = buildTicketFields(prestamo, users);

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black [&_h1]:text-black">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <Ticket size={32} />
            <h1 className="text-2xl font-semibold">Ticket de préstamo #{prestamo.id}</h1>
            <p className="text-sm text-black/70">
              El préstamo se registró correctamente. Guarda o revisa este comprobante.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label}>
                  <dt className="text-caption text-black/60">{field.label}</dt>
                  <dd className="text-sm font-medium">{field.value ?? "-"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="primary" onClick={() => navigate("/dashboard/prestamos", { replace: true })}>
              Volver al listado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
