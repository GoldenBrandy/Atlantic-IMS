// Pagina que envuelve el formulario para crear un inventario nuevo.
import InventarioRegisterForm from "../components/InventarioRegisterForm";

export default function CreateInventarioPage(props) {
  return (
    <div className="w-full flex justify-center">
      <InventarioRegisterForm {...props} />
    </div>
  );
}
