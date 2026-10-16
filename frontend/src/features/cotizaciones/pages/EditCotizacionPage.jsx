import CotizacionRegisterForm from "../components/CotizacionRegisterForm";
import { useParams } from "react-router-dom";

export default function EditCotizacionPage(props) {
  const { id } = useParams();

  return (
    <div className="w-full flex justify-center">
      <CotizacionRegisterForm
        {...props}
        cotizacionId={id}
        showBackButton={true}
        backTo="/dashboard/cotizaciones"
      />
    </div>
  );
}
