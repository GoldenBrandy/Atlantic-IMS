import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, PackagePlus, Tags, HandCoins } from "lucide-react";
import heroImage from "@/assets/images/LogoTipo1.png";

const options = [
  {
    label: "Crear usuario",
    to: "/dashboard/usuarios/crear",
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Crear producto",
    to: "/dashboard/productos/crear",
    icon: PackagePlus,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Crear marca",
    to: "/dashboard/marcas/crear",
    icon: Tags,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    label: "Crear préstamo",
    to: "/dashboard/prestamos/crear",
    icon: HandCoins,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

// Obtiene el nombre del usuario que inicio sesion para el saludo dinamico.
function getUserFirstName() {
  try {
    const stored = JSON.parse(sessionStorage.getItem("user"));
    if (!stored?.name) return "usuario";
    return stored.name.split(" ")[0];
  } catch {
    return "usuario";
  }
}

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const userName = useMemo(() => getUserFirstName(), []);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center p-6">
      <div className="w-full max-w-4xl text-black">
        <h1 className="mb-4 text-2xl font-semibold text-black">Atlantic IMS</h1>

        <div className="flex flex-col items-center gap-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-lg sm:flex-row sm:justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold">Hi, {userName}!</h2>
            <p className="mt-1 text-neutral-500">¿Qué vamos a hacer hoy?</p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {options.map(({ label, to, icon: Icon, iconBg, iconColor }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(to)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-neutral-100"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <img
            src={heroImage}
            alt="Ilustración de bienvenida"
            className="hidden w-56 shrink-0 sm:block"
          />
        </div>
      </div>
    </div>
  );
}
