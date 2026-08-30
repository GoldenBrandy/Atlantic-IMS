import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Package, ShoppingBag, Tag, UsersRound, ClipboardList, HandCoins, Loader2 } from "lucide-react";
import SearchField from "../ui/SearchField";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { getMateriales } from "@/features/materiales/services/materialService";
import { getProductos } from "@/features/productos/services/productoService";
import { getMarcas } from "@/features/marcas/services/marcaService";
import { getGrupos } from "@/features/grupos/services/grupoService";
import { getTareas } from "@/features/tareas/services/tareaService";
import { getPrestamos } from "@/features/prestamos/services/prestamoService";

// Busqueda global: trae una vez (al primer foco) los listados de cada
// modulo ya existentes y filtra todo del lado del cliente, igual que hace
// el buscador de cada DataTable con sus propias filas.
const CATEGORIES = [
  {
    key: "usuarios",
    label: "Usuarios",
    icon: Users,
    fetch: getUsers,
    getLabel: formatUserName,
    getSubtitle: (item) => item.user_email,
    getPath: (item) => `/dashboard/users/${item.id}/edit`,
  },
  {
    key: "materiales",
    label: "Materiales",
    icon: Package,
    fetch: getMateriales,
    getLabel: (item) => item.name,
    getSubtitle: (item) => item.type,
    getPath: (item) => `/dashboard/materiales/${item.id}/edit`,
  },
  {
    key: "productos",
    label: "Productos",
    icon: ShoppingBag,
    fetch: getProductos,
    getLabel: (item) => item.name,
    getSubtitle: (item) => item.product_code,
    getPath: (item) => `/dashboard/productos/${item.id}/edit`,
  },
  {
    key: "marcas",
    label: "Marcas",
    icon: Tag,
    fetch: getMarcas,
    getLabel: (item) => item.name,
    getSubtitle: () => "Marca",
    getPath: (item) => `/dashboard/marcas/${item.id}/edit`,
  },
  {
    key: "grupos",
    label: "Grupos",
    icon: UsersRound,
    fetch: getGrupos,
    getLabel: (item) => item.group_name,
    getSubtitle: (item) => item.group_code,
    getPath: (item) => `/dashboard/grupos/${item.id}/edit`,
  },
  {
    key: "tareas",
    label: "Tareas",
    icon: ClipboardList,
    fetch: getTareas,
    getLabel: (item) => item.task_name,
    getSubtitle: (item) => item.status,
    getPath: (item) => `/dashboard/tareas/${item.id}/edit`,
  },
  {
    key: "prestamos",
    label: "Préstamos",
    icon: HandCoins,
    fetch: getPrestamos,
    getLabel: (item) => (item.materials ?? []).map((m) => m.name).join(", ") || `Préstamo #${item.id}`,
    getSubtitle: (item) => item.justification,
    getPath: (item) => `/dashboard/prestamos/${item.id}/edit`,
  },
];

const MAX_RESULTS_PER_CATEGORY = 5;

export default function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dataByCategory, setDataByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Trae los listados de cada modulo la primera vez que el usuario interactua
  // con el buscador (no en cada carga de pagina).
  const loadAllData = () => {
    if (hasLoaded || isLoading) return;
    setIsLoading(true);
    Promise.allSettled(CATEGORIES.map((category) => category.fetch())).then((results) => {
      const next = {};
      results.forEach((result, index) => {
        next[CATEGORIES[index].key] = result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [];
      });
      setDataByCategory(next);
      setHasLoaded(true);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const resultsByCategory = normalizedQuery
    ? CATEGORIES.map((category) => {
        const items = (dataByCategory[category.key] ?? [])
          .filter((item) => {
            const haystack = `${category.getLabel(item) ?? ""} ${category.getSubtitle(item) ?? ""}`.toLowerCase();
            return haystack.includes(normalizedQuery);
          })
          .slice(0, MAX_RESULTS_PER_CATEGORY);
        return { ...category, items };
      }).filter((category) => category.items.length > 0)
    : [];

  const totalResults = resultsByCategory.reduce((sum, category) => sum + category.items.length, 0);

  const handleChange = (value) => {
    setQuery(value);
    setIsOpen(true);
    loadAllData();
  };

  const handleSelect = (category, item) => {
    navigate(category.getPath(item));
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative md:block w-full max-w-64 shrink-0" onFocus={() => { setIsOpen(true); loadAllData(); }}>
      <SearchField
        value={query}
        onChange={handleChange}
        onSubmit={handleChange}
        onClear={() => {
          setQuery("");
          setIsOpen(false);
        }}
        placeholder="Buscar..."
        size="sm"
        variant="filled"
      />

      {isOpen && normalizedQuery && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" />
              Buscando...
            </div>
          )}

          {!isLoading && totalResults === 0 && (
            <p className="px-3 py-4 text-center text-sm text-neutral-500">
              Sin resultados para "{query}"
            </p>
          )}

          {!isLoading &&
            resultsByCategory.map((category) => (
              <div key={category.key} className="mb-1 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-caption font-semibold uppercase tracking-wide text-neutral-400">
                  {category.label}
                </p>
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(category, item)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-neutral-800 transition-colors hover:bg-neutral-100"
                  >
                    <category.icon size={16} className="shrink-0 text-neutral-400" />
                    <span className="flex-1 truncate">
                      <span className="block truncate font-medium">{category.getLabel(item) || "-"}</span>
                      {category.getSubtitle(item) && (
                        <span className="block truncate text-caption text-neutral-500">{category.getSubtitle(item)}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
