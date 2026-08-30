import { useEffect, useMemo, useState, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReportConfigModal } from "@/shared";
import { USER_REPORT_FIELDS } from "../reports/userReportFields";
import { getUserColumns } from "../table/users.column.jsx";
import { getUsers, bulkDisableUsers, setUserActive } from "../services/userService";
import { getGroups } from "@/features/access/services/groupService";
import { isSuperUser } from "@/features/auth";
import { sileo } from "sileo";

export default function ListUserPage() {
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const canDisable = isSuperUser();

  const loadUsers = useCallback(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los usuarios",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadUsers();

    getGroups()
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [loadUsers]);

  const handleToggleStatus = useCallback(async (user, nextValue) => {
    try {
      await setUserActive(user.id, nextValue);
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, is_active: nextValue } : item)),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${user.user_name} quedó ${nextValue ? "activo" : "inactivo"}`,
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo actualizar el estado",
        description: err?.message || String(err),
      });
    }
  }, []);

  const userColumns = useMemo(
    () => getUserColumns(groups, canDisable ? handleToggleStatus : undefined),
    [groups, canDisable, handleToggleStatus],
  );

  const handleBulkDisable = async (ids) => {
    try {
      await bulkDisableUsers(ids);
      sileo.success({
        title: "Usuarios deshabilitados",
        description: `${ids.length} usuario(s) deshabilitado(s) correctamente`,
      });
      loadUsers();
    } catch (err) {
      sileo.error({
        title: "No se pudieron deshabilitar los usuarios",
        description: err?.message || String(err),
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Usuarios</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsReportModalOpen(true)}
            className="gap-2"
          >
            <Plus size={18} />
            Reporte
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/dashboard/usuarios/crear")}
            className="gap-2"
          >
            <Plus size={18} />
            Crear usuario
          </Button>
        </div>
      </div>

      <ReportConfigModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={users}
        fields={USER_REPORT_FIELDS}
        title="Reporte de usuarios"
        fileNamePrefix="usuarios"
        filterField={{ key: "document_number", label: "Número de documento" }}
      />

      <DataTable
        data={users}
        columns={userColumns}
        enableSelection={canDisable}
        onBulkDisable={handleBulkDisable}
        variant="clean"
      />
    </div>
  );
}
