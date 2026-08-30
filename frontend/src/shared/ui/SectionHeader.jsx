// Encabezado de seccion con circulo numerado, usado en los formularios de
// registro para agrupar campos relacionados (estilo pasos numerados).
export default function SectionHeader({ step, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary-950) text-xs font-semibold text-white">
        {step}
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}
