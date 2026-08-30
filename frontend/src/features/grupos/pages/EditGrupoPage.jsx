import GrupoRegisterForm from "../components/GrupoRegisterForm";
import { useParams } from "react-router-dom";

export default function EditGrupoPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <GrupoRegisterForm
        {...props}
        grupoId={id}
        showBackButton={true}
        backTo="/dashboard/grupos"
      />
    </div>
  );
}