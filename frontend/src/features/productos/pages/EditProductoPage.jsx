import ProductoRegisterForm from "../components/ProductoRegisterForm";
import { useParams } from "react-router-dom";

export default function EditProductoPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <ProductoRegisterForm
        {...props}
        productoId={id}
        showBackButton={true}
        backTo="/dashboard/productos"
      />
    </div>
  );
}