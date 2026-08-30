import TareaRegisterForm from "../components/TareaRegisterForm";
import { useParams } from "react-router-dom";

export default function EditTareaPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <TareaRegisterForm
        {...props}
        tareaId={id}
        showBackButton={true}
        backTo="/dashboard/tareas"
      />
    </div>
  );
}
