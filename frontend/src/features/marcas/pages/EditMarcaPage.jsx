import MarcaRegisterForm from "../components/MarcaRegisterForm";
import { useParams } from "react-router-dom";

export default function EditMarcaPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <MarcaRegisterForm
        {...props}
        marcaId={id}
        showBackButton={true}
        backTo="/dashboard/marcas"
      />
    </div>
  );
}