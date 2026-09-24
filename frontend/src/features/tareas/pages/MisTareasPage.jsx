import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MoveLeft, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { getUsers, formatUserName } from "@/features/users/services/userService";
import { getTareas, markTareaComplete } from "../services/tareaService";
import { TASK_STATUS_OPTIONS } from "../services/tareaOptionsService";
import { Button, IconButton } from "@/shared";
import { sileo } from "sileo";

function statusLabel(status) {
  return TASK_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? status;
}

export default function MisTareasPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userId = currentUser?.id ?? null;

  const [tareas, setTareas] = useState([]);
  const [users, setUsers] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const loadTareas = useCallback(() => {
    return getTareas()
      .then((data) => setTareas(Array.isArray(data) ? data : []))
      .catch((err) => {
        sileo.error({ title: "No se pudieron cargar tus tareas", description: err?.message || String(err) });
      })
      .finally(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    loadTareas();
    getUsers().then((data) => setUsers(Array.isArray(data) ? data : [])).catch(console.error);
  }, [loadTareas]);

  const misTareas = tareas.filter((tarea) =>
    (tarea.assigned_users ?? []).some((id) => String(id) === String(userId)),
  );

  const handleComplete = async (tarea) => {
    setCompletingId(tarea.id);
    try {
      await markTareaComplete(tarea.id);
      sileo.success({
        title: "Tarea completada",
        description: "Se notificó a quien te la asignó para que la verifique",
      });
      await loadTareas();
    } catch (err) {
      sileo.error({ title: "No se pudo completar la tarea", description: err?.message || String(err) });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="relative min-h-full w-full flex-1 overflow-hidden p-6">
      <div className="relative text-black">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-4 flex items-center gap-2">
            <IconButton ariaLabel="Volver" variant="ghost" onClick={() => navigate("/dashboard/perfil")}>
              <MoveLeft />
            </IconButton>
          </div>

          <h1 className="mb-1 text-center text-2xl font-semibold">Mis tareas</h1>
          <p className="mb-6 text-center text-sm text-black">
            Tareas que te han sido asignadas. Marca una como completada cuando termines.
          </p>

          {!hasLoaded ? (
            <p className="text-center text-sm text-neutral-500">Cargando...</p>
          ) : misTareas.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-neutral-500">No tienes tareas asignadas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {misTareas.map((tarea) => {
                const canComplete = tarea.status !== "completada" && tarea.status !== "cancelada";
                const myEndDate =
                  tarea.assigned_user_end_dates?.[userId] ?? tarea.end_date ?? null;
                const assigner = users.find((user) => String(user.id) === String(tarea.assigned_by));

                return (
                  <div key={tarea.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">{tarea.task_name}</h2>
                        <p className="text-caption text-black/60">
                          Asignada por {assigner ? formatUserName(assigner) : "—"}
                          {myEndDate ? ` · vence ${String(myEndDate).slice(0, 10)}` : ""}
                        </p>
                      </div>

                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-caption font-medium text-black/70">
                        {statusLabel(tarea.status)}
                        {tarea.status === "completada" && tarea.verified_at ? " · verificada" : ""}
                      </span>
                    </div>

                    {tarea.description && (
                      <p className="mt-3 text-sm text-black/80">{tarea.description}</p>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className="h-full rounded-full bg-(--primary-950)"
                          style={{ width: `${tarea.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-caption">{tarea.progress ?? 0}%</span>
                    </div>

                    {canComplete && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="primary"
                          type="button"
                          className="gap-2"
                          disabled={completingId === tarea.id}
                          onClick={() => handleComplete(tarea)}
                        >
                          <CheckCircle2 size={16} />
                          {completingId === tarea.id ? "Guardando..." : "Marcar como completada"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
