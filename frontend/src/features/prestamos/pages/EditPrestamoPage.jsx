import PrestamoRegisterForm from "../components/PrestamoRegisterForm";
import { useParams } from "react-router-dom";

export default function EditPrestamoPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <PrestamoRegisterForm
        {...props}
        prestamoId={id}
        showBackButton={true}
        backTo="/dashboard/prestamos"
      />
    </div>
  );
}