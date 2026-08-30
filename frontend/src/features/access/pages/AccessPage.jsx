import { useEffect, useState } from "react";
import AccessSidebar from "../../../shared/ui/AccessSidebar";
import PermissionModule from "../components/PermissionModule";
import { updateGroupPermissions } from "../services/groupService";
import {
  getAllPermissions,
  updateUserPermissions,
} from "../services/permissionService";

export default function AccessPage() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [groupPermissions, setGroupPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [userPermissions, setUserPermissions] = useState([]);

  const [allPermissions, setAllPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [permissionsDraft, setPermissionsDraft] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const mode = selectedGroup ? "group" : selectedUser ? "user" : null;
  const activeLabel = mode === "user" ? "Usuario" : "Grupo";
  const activeName = mode === "group" ? selectedGroupName : mode === "user" ? selectedUserName : "";

  useEffect(() => {
    getAllPermissions().then(setAllPermissions).catch(console.error);
  }, []);

  // Cuando el sidebar carga los permisos del grupo/usuario seleccionado,
  // sincroniza tambien el borrador y limpia el estado de edicion, evitando
  // hacerlo en un efecto aparte (setState en efecto genera renders en cascada).
  const handleGroupPermissionsLoaded = (permissions) => {
    setGroupPermissions(permissions);
    setPermissionsDraft(permissions);
    setIsEditing(false);
    setSaveError("");
  };

  const handleUserPermissionsLoaded = (permissions) => {
    setUserPermissions(permissions);
    setPermissionsDraft(permissions);
    setIsEditing(false);
    setSaveError("");
  };

  const handleEdit = () => {
    setSaveError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    const committed = mode === "group" ? groupPermissions : userPermissions;
    setPermissionsDraft([...committed]);
    setSaveError("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    const permissionCodenames = permissionsDraft.map(
      (permission) => permission.permission_codename,
    );

    try {
      setIsSaving(true);
      setSaveError("");

      if (mode === "group") {
        const response = await updateGroupPermissions(
          selectedGroup,
          permissionCodenames,
        );
        setGroupPermissions(response.permissions);
        setPermissionsDraft([...response.permissions]);
      } else if (mode === "user") {
        const response = await updateUserPermissions(
          selectedUser,
          permissionCodenames,
        );
        setUserPermissions(response.permissions);
        setPermissionsDraft([...response.permissions]);
      }

      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start lg:gap-8">
        <AccessSidebar
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          setSelectedGroupName={setSelectedGroupName}
          setGroupPermissions={handleGroupPermissionsLoaded}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          setSelectedUserName={setSelectedUserName}
          setUserPermissions={handleUserPermissionsLoaded}
        />

        <div className="min-w-0">
          <h1 className="mb-4 text-2xl font-semibold text-slate-900">
            Gestión de permisos
          </h1>

          <PermissionModule
            entityLabel={activeLabel}
            selectedGroupName={activeName}
            isEditing={isEditing}
            allPermissions={allPermissions}
            permissionsDraft={permissionsDraft}
            setPermissionsDraft={setPermissionsDraft}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
            saveError={saveError}
          />
        </div>
      </div>
    </div>
  );
}