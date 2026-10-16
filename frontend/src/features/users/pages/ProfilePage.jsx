import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Mail } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { getUserById } from "../services/userService";
import { getGroups } from "@/features/access/services/groupService";
import { getDocumentTypes } from "../services/selectService";
import { getSupportEmail } from "@/features/settings/services/settingsService";
import ProfileView from "../components/ProfileView";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { Button } from "@/shared";
import { sileo } from "sileo";

// "Ver perfil" siempre es de solo lectura, sin importar el rol: para editar
// la informacion personal de un usuario se usa la gestion de usuarios
// (lista de usuarios -> editar). Aqui solo se puede ver los datos, cambiar
// la contraseña propia y entrar a "Mis tareas".
export default function ProfilePage() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id ?? null;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    getGroups().then((data) => setGroups(Array.isArray(data) ? data : [])).catch(console.error);
    getDocumentTypes().then(setDocumentTypes).catch(console.error);
    getSupportEmail().then(setSupportEmail).catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    getUserById(userId)
      .then(setUser)
      .catch((err) => {
        sileo.error({
          title: "No se pudo cargar tu perfil",
          description: err?.message || String(err),
        });
      });
  }, [userId]);

  if (!user) return null;

  const groupName = groups.find((group) => group.group_id === user.group_id)?.group_name ?? "";
  const documentTypeLabel = documentTypes.find((type) => type.id === user.document_type)?.label ?? user.document_type;

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black [&_h1]:text-black [&_input]:text-black [&_input::placeholder]:text-black/70 [&_label]:text-black [&_select]:text-black [&_span]:text-black">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-semibold">Mi perfil</h1>
              <p className="text-sm text-black">
                Para modificar tu información personal, hazlo desde la gestión de usuarios. Aquí puedes ver tus datos y cambiar tu contraseña.
              </p>
            </div>

            <Button
              variant="secondary"
              type="button"
              className="gap-2"
              onClick={() => navigate("/dashboard/mis-tareas")}
            >
              <ListChecks size={16} />
              Mis tareas
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            <ProfileView user={user} groupName={groupName} documentTypeLabel={documentTypeLabel} />

            {supportEmail && (
              <div className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:border sm:border-neutral-200 sm:bg-white sm:p-6 sm:shadow-sm">
                <h2 className="mb-4 text-base font-semibold">¿Necesitas ayuda?</h2>
                <p className="flex items-center gap-2 text-sm text-black/80">
                  <Mail size={16} />
                  Escribe a soporte: <span className="font-medium">{supportEmail}</span>
                </p>
              </div>
            )}

            <ChangePasswordForm userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
