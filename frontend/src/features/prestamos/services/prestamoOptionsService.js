// Opciones estaticas para los selects del formulario de prestamos.
// Se exportan tambien como constantes planas (no async) para poder
// traducir id -> label de forma sincrona en la tabla de listado.

export const LOAN_TYPE_OPTIONS = [
  { id: "interno", label: "Préstamo interno" },
  { id: "externo", label: "Préstamo externo" },
];

export async function getLoanTypeOptions() {
  return LOAN_TYPE_OPTIONS;
}