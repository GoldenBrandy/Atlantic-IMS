import CategoriaRegisterForm from "../components/CategoriaRegisterForm";
import { useParams } from "react-router-dom";

export default function EditCategoriaPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <CategoriaRegisterForm
        {...props}
        categoriaId={id}
        showBackButton={true}
        backTo="/dashboard/categorias"
      />
    </div>
  );
}
