// Indicador de progreso multi-paso reutilizado por todos los formularios de
// registro (Usuario, Materiales, Productos, Tareas, Prestamos). Cada paso
// centra su circulo sobre el centro de su etiqueta (grid de columnas
// iguales), con una linea punteada que conecta el centro de un circulo con
// el centro del siguiente.
export default function StepIndicator({ steps, currentStep }) {
  const gridStyle = { gridTemplateColumns: `repeat(${steps.length}, 1fr)` };

  return (
    <div className="mb-8">
      <div className="grid" style={gridStyle}>
        {steps.map((_, index) => {
          const isDone = index <= currentStep;
          const isNext = index === currentStep + 1;
          const isLast = index === steps.length - 1;

          return (
            <div key={steps[index]} className="relative flex justify-center">
              {!isLast && (
                <div
                  className={`absolute top-1/2 left-1/2 h-0 w-full -translate-y-1/2 border-t-2 border-dashed transition-colors ${
                    index < currentStep ? "border-(--primary-950)" : "border-neutral-300"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isDone
                    ? "bg-(--primary-950) text-white"
                    : isNext
                      ? "border-2 border-neutral-800 text-neutral-800"
                      : "border-2 border-neutral-300 text-neutral-400"
                }`}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 grid" style={gridStyle}>
        {steps.map((label, index) => {
          const isCurrent = index === currentStep;
          const isNext = index === currentStep + 1;

          return (
            <div key={label} className="px-1 text-center">
              <p
                className={`text-sm ${
                  isCurrent
                    ? "font-semibold text-(--primary-950)"
                    : isNext
                      ? "font-medium text-neutral-900"
                      : "font-medium text-neutral-400"
                }`}
              >
                {label}
              </p>
              <p className={`text-caption font-normal ${isCurrent ? "text-(--primary-950)" : "text-neutral-500"}`}>
                {index < currentStep ? "Completado" : isCurrent ? "En Progreso" : "Pendiente"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
