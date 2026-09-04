// Pagina que envuelve el formulario para editar un inventario existente,
// leyendo el id desde la URL.
import InventarioRegisterForm from "../components/InventarioRegisterForm";
import { useParams } from "react-router-dom";

export default function EditInventarioPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <InventarioRegisterForm
        {...props}
        inventarioId={id}
        showBackButton={true}
        backTo="/dashboard/inventarios"
      />
    </div>
  );
}
