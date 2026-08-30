import { useEffect, useMemo, useState } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTareaColumns } from "../table/tareas.column.jsx";
import { getTareas } from "../services/tareaService.js";
import { getUsers } from "@/features/users/services/userService";
import { sileo } from "sileo";

export default function ListTareasPage() {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getTareas()
      .then(setTareas)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar las tareas",
          description: err?.message || String(err),
        });
      });

    getUsers().then(setUsers).catch(console.error);
  }, []);

  const tareaColumns = useMemo(() => getTareaColumns(users), [users]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Tareas</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/tareas/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear tarea
        </Button>
      </div>

      <DataTable data={tareas} columns={tareaColumns} variant="clean" />
    </div>
  );
}
