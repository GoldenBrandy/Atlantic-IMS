// Construye la lista de campos del "ticket" del prestamo (comprobante),
// reutilizada tanto en el modal "Ver ticket" (PrestamoRowActions) como en la
// pantalla de ticket que se muestra obligatoriamente tras crear un prestamo
// (PrestamoTicketPage).
import { formatUserName } from "@/features/users/services/userService";
import { LOAN_TYPE_OPTIONS } from "./prestamoOptionsService";
import { getPrestamoStatus } from "./prestamoStatus";

function findLabel(options, id) {
  return options.find((option) => option.id === id)?.label ?? id;
}

// Nombre + numero de documento del participante, o "-" si no se selecciono
// ninguno (ambos campos son opcionales).
function describeParticipant(users, id, documentNumber) {
  if (!id) return "-";
  const user = users.find((user) => String(user.id) === String(id));
  const name = user ? formatUserName(user) : id;
  return documentNumber ? `${name} (Doc. ${documentNumber})` : name;
}

export function buildTicketFields(prestamo, users = []) {
  const status = getPrestamoStatus(prestamo);

  return [
    { label: "Ítem(s) prestado(s)", value: (prestamo.materials ?? []).map((material) => material.name).join(", ") || "-" },
    {
      label: "Usuario solicitante",
      value: describeParticipant(users, prestamo.requesting_user, prestamo.requesting_user_document),
    },
    {
      label: "Usuario prestador",
      value: describeParticipant(users, prestamo.lending_user, prestamo.lending_user_document),
    },
    { label: "Identidad del solicitante confirmada", value: prestamo.requester_identity_confirmed ? "Sí" : "No" },
    { label: "Identidad del prestador confirmada", value: prestamo.lender_identity_confirmed ? "Sí" : "No" },
    { label: "Ficha de aprendices", value: prestamo.ficha || "-" },
    { label: "Tipo de préstamo", value: findLabel(LOAN_TYPE_OPTIONS, prestamo.loan_type) },
    { label: "Fecha de salida", value: String(prestamo.start_date ?? "").slice(0, 10) },
    { label: "Fecha de entrega", value: String(prestamo.due_date ?? "").slice(0, 10) },
    { label: "Estado", value: status.label },
    { label: "Fecha de devolución", value: prestamo.returned_at ? String(prestamo.returned_at).slice(0, 10) : "-" },
    { label: "Justificación de uso", value: prestamo.justification },
    {
      label: "Firma digital",
      value: prestamo.signature_url ? (
        prestamo.signature_url.startsWith("data:image") ? (
          <img src={prestamo.signature_url} alt="Firma digital" className="h-16 max-w-[10rem] rounded border object-contain" />
        ) : (
          "Documento adjunto"
        )
      ) : (
        "-"
      ),
    },
  ];
}
