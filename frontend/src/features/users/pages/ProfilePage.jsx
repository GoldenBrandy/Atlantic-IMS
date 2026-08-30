import { useState, useEffect } from "react";
import { getCurrentUser, isSuperUser } from "@/features/auth";
import { getUserById } from "../services/userService";
import { getGroups } from "@/features/access/services/groupService";
import { getDocumentTypes } from "../services/selectService";
import UserRegisterForm from "../components/UserRegisterForm";
import ProfileView from "../components/ProfileView";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { sileo } from "sileo";

export default function ProfilePage() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id ?? null;
  const canEditPersonalInfo = isSuperUser();

  // El super administrador puede editar su propia informacion personal,
  // igual que la de cualquier otro usuario: reutiliza el formulario completo.
  if (canEditPersonalInfo) {
    return (
      <div className="w-full flex justify-center">
        <UserRegisterForm
          userId={userId}
          title="Mi perfil"
          subtitle="Actualiza tu información personal"
          nextTo="/dashboard"
          cancelTo="/dashboard"
          showBackButton={true}
          backTo="/dashboard"
        />
      </div>
    );
  }

  return <ReadOnlyProfile userId={userId} />;
}

// Vista de solo lectura para cualquier usuario que no sea super administrador:
// puede ver sus datos pero solo puede cambiar su contraseña.
function ReadOnlyProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    getGroups().then((data) => setGroups(Array.isArray(data) ? data : [])).catch(console.error);
    getDocumentTypes().then(setDocumentTypes).catch(console.error);
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
          <h1 className="mb-1 text-center text-2xl font-semibold">Mi perfil</h1>
          <p className="mb-6 text-center text-sm text-black">
            Solo un super administrador puede modificar tu información personal. Aquí puedes cambiar tu contraseña.
          </p>

          <div className="flex flex-col gap-6">
            <ProfileView user={user} groupName={groupName} documentTypeLabel={documentTypeLabel} />
            <ChangePasswordForm userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
