// Muestra los datos de un usuario en modo solo lectura. Se usa en "Mi perfil"
// para cualquier usuario que no sea super administrador: puede ver su
// informacion pero no puede editarla (solo puede cambiar su contraseña).
function Field({ label, value }) {
  return (
    <div>
      <p className="text-caption text-black/60">{label}</p>
      <p className="text-base text-black">{value || "-"}</p>
    </div>
  );
}

export default function ProfileView({ user, groupName, documentTypeLabel }) {
  const fullName = [user.user_name, user.last_name_1].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Información General</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-(--primary-950)">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <span className="text-caption text-black/50">Sin foto</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombre completo" value={fullName} />
            <Field label="Tipo de documento" value={documentTypeLabel} />
            <Field label="Número de documento" value={user.document_number} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Contacto</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Correo electrónico" value={user.user_email} />
            <Field label="Correo institucional" value={user.institutional_email} />
            <Field label="Número de celular" value={user.user_phone} />
            <Field label="Dirección" value={user.address} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Rol y Vinculación</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tipo de usuario" value={groupName} />
            <Field label="Estado" value={user.is_active ? "Activo" : "Inactivo"} />
            <Field label="Fecha de inicio" value={user.start_date ? String(user.start_date).slice(0, 10) : ""} />
            <Field label="Fecha de finalización" value={user.end_date ? String(user.end_date).slice(0, 10) : ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
