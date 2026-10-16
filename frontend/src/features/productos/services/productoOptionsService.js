// Opciones estaticas para los selects del formulario de productos.
// Se exportan tambien como constantes planas (no async) para poder
// traducir id -> label de forma sincrona en la tabla de listado.

export const PRODUCT_TYPE_OPTIONS = [
  { id: "equipo", label: "Equipo" },
  { id: "consumible", label: "Consumible" },
  { id: "herramienta", label: "Herramienta" },
  { id: "insumo", label: "Insumo" },
];

export async function getProductTypeOptions() {
  return PRODUCT_TYPE_OPTIONS;
}