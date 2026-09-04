import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  LayoutDashboard,
  Users,
  Package,
  PackageCheck,
  Armchair,
  UsersRound,
  ShoppingBag,
  Tag,
  ClipboardList,
  FileBarChart,
  HandCoins,
  History,
  Boxes,
} from "lucide-react";
import { isSuperUser } from "@/features/auth";

// Modulos disponibles en el panel de accesos rapidos del navbar (estilo
// selector de apps de Google). Reemplaza la lista larga de enlaces para no
// sobrecargar la barra de navegacion.
const MODULES = [
  { label: "Inicio", to: "/dashboard", icon: LayoutDashboard, iconBg: "bg-slate-100", iconColor: "text-slate-600" },
  { label: "Usuarios", to: "/dashboard/userList", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Material Devolutivo", to: "/dashboard/materiales?tipo=devolutivo", icon: PackageCheck, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { label: "Material de Consumo", to: "/dashboard/materiales?tipo=consumo", icon: Package, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { label: "Muebles y Enseres", to: "/dashboard/materiales?tipo=muebles-y-enseres", icon: Armchair, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { label: "Grupos", to: "/dashboard/grupos", icon: UsersRound, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Productos", to: "/dashboard/productos", icon: ShoppingBag, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  { label: "Marcas", to: "/dashboard/marcas", icon: Tag, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { label: "Tareas", to: "/dashboard/tareas", icon: ClipboardList, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  { label: "Reportes", to: "/dashboard/reportes", icon: FileBarChart, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  { label: "Préstamos", to: "/dashboard/prestamos", icon: HandCoins, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { label: "Inventarios", to: "/dashboard/inventarios", icon: Boxes, iconBg: "bg-lime-100", iconColor: "text-lime-600" },
  { label: "Historial", to: "/dashboard/historial", icon: History, iconBg: "bg-neutral-200", iconColor: "text-neutral-700", superUserOnly: true },
];

export default function AppsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handleSelect = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Módulos"
        className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        <LayoutGrid size={22} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg shadow-black/10">
          <p className="mb-3 px-1 text-caption font-semibold text-neutral-500">Módulos</p>
          <div className="grid grid-cols-3 gap-1">
            {MODULES.filter((module) => !module.superUserOnly || isSuperUser()).map((module) => (
              <button
                key={module.label}
                type="button"
                onClick={() => handleSelect(module.to)}
                className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-neutral-100"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${module.iconBg} ${module.iconColor}`}>
                  <module.icon size={20} />
                </span>
                <span className="text-xs font-medium leading-tight text-neutral-700">{module.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
