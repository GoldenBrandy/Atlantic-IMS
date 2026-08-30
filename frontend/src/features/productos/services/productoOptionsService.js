// Opciones estaticas para los selects del formulario de productos.
// Se exportan tambien como constantes planas (no async) para poder
// traducir id -> label de forma sincrona en la tabla de listado.

export const PRODUCT_TYPE_OPTIONS = [
  { id: "equipo", label: "Equipo" },
  { id: "consumible", label: "Consumible" },
  { id: "herramienta", label: "Herramienta" },
  { id: "insumo", label: "Insumo" },
];

export const CATEGORY_OPTIONS = [
  { id: "tecnologia", label: "Tecnología" },
  { id: "oficina", label: "Oficina" },
  { id: "laboratorio", label: "Laboratorio" },
  { id: "mantenimiento", label: "Mantenimiento" },
];

export async function getProductTypeOptions() {
  return PRODUCT_TYPE_OPTIONS;
}

export async function getCategoryOptions() {
  return CATEGORY_OPTIONS;
}