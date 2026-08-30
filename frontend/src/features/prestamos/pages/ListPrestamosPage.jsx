import { useEffect, useMemo, useState, useCallback } from "react";
import { DataTable, Button } from "@/shared";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPrestamoColumns } from "../table/prestamos.column.jsx";
import { getPrestamos } from "../services/prestamoService.js";
import { getUsers } from "@/features/users/services/userService";
import { sileo } from "sileo";

export default function ListPrestamosPage() {
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState([]);
  const [users, setUsers] = useState([]);

  const loadPrestamos = useCallback(() => {
    getPrestamos()
      .then(setPrestamos)
      .catch((err) => {
        sileo.error({
          title: "No se pudieron cargar los préstamos",
          description: err?.message || String(err),
        });
      });
  }, []);

  useEffect(() => {
    loadPrestamos();

    getUsers()
      .then(setUsers)
      .catch(console.error);
  }, [loadPrestamos]);

  const prestamoColumns = useMemo(
    () => getPrestamoColumns(users),
    [users],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Préstamos</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/dashboard/prestamos/crear")}
          className="gap-2"
        >
          <Plus size={18} />
          Crear préstamo
        </Button>
      </div>

      <DataTable data={prestamos} columns={prestamoColumns} variant="clean" />
    </div>
  );
}