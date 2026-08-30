import { useContext, useMemo, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownContent } from "./Dropdown";
import { DropdownContext } from "./DropdownContext";

// Panel de opciones: buscador + lista de filas completas (checkbox + label)
// resaltadas en azul al pasar el mouse, con acciones "Limpiar"/"Listo" al
// pie. Vive dentro de <Dropdown> para poder cerrar el panel desde "Listo".
// DropdownContent solo renderiza este panel mientras open=true (si no,
// retorna null), asi que cada apertura es un montaje nuevo: el estado local
// del buscador ya arranca vacio sin necesidad de resetearlo con un efecto.
function OptionsPanel({ options, selected, onToggle }) {
  const { setOpen } = useContext(DropdownContext);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const handleClear = () => {
    selected.forEach((id) => onToggle(id));
  };

  return (
    <div className="flex w-72 flex-col">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2">
        <Search size={16} className="shrink-0 text-neutral-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full text-sm text-black outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="max-h-64 overflow-y-auto py-1">
        {filteredOptions.length === 0 && (
          <p className="px-4 py-3 text-caption text-neutral-400">Sin resultados</p>
        )}

        {filteredOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-black transition-colors hover:bg-(--primary-950) hover:text-white"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  isSelected
                    ? "border-(--primary-950) bg-(--primary-950) text-white group-hover:border-white group-hover:bg-white group-hover:text-(--primary-950)"
                    : "border-neutral-300 group-hover:border-white"
                }`}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="flex-1 truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 p-2">
        <button
          type="button"
          onClick={handleClear}
          disabled={selected.length === 0}
          className="rounded-full border border-(--primary-950) px-4 py-1.5 text-sm font-medium text-(--primary-950) transition-colors hover:bg-(--primary-950)/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full bg-(--primary-950) px-5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-(--primary-800)"
        >
          Listo
        </button>
      </div>
    </div>
  );
}

export default function MultiSelectField({
  label,
  required = false,
  icon: Icon,
  placeholder = "Selecciona una o más opciones",
  options,
  selected,
  onToggle,
  error,
  dense = false,
  labelClassName,
}) {
  const selectedLabel = useMemo(() => {
    if (selected.length === 0) return placeholder;
    return selected
      .map((id) => options.find((option) => option.id === id)?.label)
      .filter(Boolean)
      .join(", ");
  }, [selected, options, placeholder]);

  const heightClass = dense ? "h-10" : "h-12";

  return (
    <div className="w-full">
      <label className={labelClassName ?? "block text-caption mb-1 w-full text-left text-text-primary"}>
        {label}
        {required && <span className="text-red-600!"> *</span>}
      </label>
      <Dropdown>
        <DropdownTrigger>
          <button
            type="button"
            className={`flex ${heightClass} w-full items-center gap-2 rounded-md border border-border px-4 text-left text-base hover:border-2 hover:border-(--primary-950) focus:border-[3px] focus:border-(--primary-950) focus:outline-none`}
          >
            {Icon && <Icon size={16} className="shrink-0 text-neutral-400" />}
            <span className="flex-1 truncate">{selectedLabel}</span>
            <ChevronDown size={16} className="shrink-0" />
          </button>
        </DropdownTrigger>
        <DropdownContent className="w-72 overflow-hidden p-0!">
          <OptionsPanel options={options} selected={selected} onToggle={onToggle} />
        </DropdownContent>
      </Dropdown>
      {error && <p className="mt-1 w-full text-left text-caption text-red-800">{error}</p>}
    </div>
  );
}
