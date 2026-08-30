import { Checkbox, Button, IconButton } from "@/shared";
import { Pencil } from "lucide-react";

export default function PermissionModule({
  entityLabel = "Grupo",
  selectedGroupName,
  allPermissions,
  isEditing,
  permissionsDraft,
  setPermissionsDraft,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  saveError,
}) {
  const hasPermission = (codename) => {
    return permissionsDraft.some(
      (permission) => permission.permission_codename === codename,
    );
  };

  const handlePermissionChange = (permission, checked) => {
    if (!checked) {
      setPermissionsDraft((prev) =>
        prev.filter(
          (item) => item.permission_codename !== permission.permission_codename,
        ),
      );

      return;
    }

    setPermissionsDraft((prev) => [...prev, permission]);
  };

  const permissionsByModule = allPermissions.reduce(
    (groupedPermissions, permission) => {
      const moduleName =
        permission.display_name ||
        permission.model ||
        permission.app_label ||
        permission.content_type_id;

      if (!groupedPermissions[moduleName]) {
        groupedPermissions[moduleName] = [];
      }

      groupedPermissions[moduleName].push(permission);

      return groupedPermissions;
    },
    {},
  );

  return (
    <section className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-neutral-500">{entityLabel}</p>

          <h2 className="text-lg font-semibold">
            {selectedGroupName || `Seleccione un ${entityLabel.toLowerCase()}`}
          </h2>
        </div>

        {!isEditing && selectedGroupName && (
          <IconButton ariaLabel="Editar permisos" onClick={onEdit}>
            <Pencil size={20} />
          </IconButton>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(permissionsByModule).map(
          ([moduleName, permissions]) => (
            <div key={moduleName} className="border-b-2 pb-6">
              <h3 className="font-medium mb-4">Módulo {moduleName}</h3>

              <div className="flex flex-wrap gap-6">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission.permission_codename}
                    id={permission.permission_codename}
                    name={permission.permission_codename}
                    label={permission.permission_name}
                    checked={hasPermission(permission.permission_codename)}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handlePermissionChange(permission, e.target.checked)
                    }
                  />
                ))}
              </div>
            </div>
          ),
        )}
      </div>

      {isEditing && (
        <div className="mt-8 space-y-3">
          {saveError && (
            <p className="text-sm text-red-700">{saveError}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>

            <Button type="button" variant="primary" onClick={onSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
