import { ChevronDown, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import AppsMenu from "./AppsMenu";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../ui/Dropdown";
import logo_1 from "@/assets/images/logo_1.png";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  return (
    <nav className="w-full bg-white py-2">
      <div className="w-full px-6 sm:px-10">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="items-center hidden sm:block shrink-0">
            <Link to="/dashboard" className="text-h1 font-heading">
              <img src={logo_1} alt="Logo" className="h-26" />
            </Link>
          </div>
          <GlobalSearch />
          <div className="flex flex-1 items-center justify-end gap-5">
            <AppsMenu />
            <div>
              <Dropdown>
                <DropdownTrigger>
                  {/* Boton visible del usuario administrador. */}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  >
                    <User size={16} />
                    Admin
                    <ChevronDown size={14} />
                  </button>
                </DropdownTrigger>
                {/* Define el panel flotante del dropdown. */}
                <DropdownContent>
                  {/* Item que navega al perfil del usuario. */}
                  <DropdownItem>
                    <Link to="/dashboard/perfil" className="block w-full">
                      Ver perfil
                    </Link>
                  </DropdownItem>
                  {/* Item que navega a gestion de permisos. */}
                  <DropdownItem>
                    <Link to="/dashboard/permisos" className="block w-full">
                      Gestion Permisos
                    </Link>
                  </DropdownItem>
                  {/* Item que ejecuta cierre de sesion. */}
                  <DropdownItem onClick={handleLogout}>
                    <span className="inline-flex items-center gap-2">
                      <LogOut size={16} />
                      Cerrar sesion
                    </span>
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
