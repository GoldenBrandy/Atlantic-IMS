import CotizacionRegisterForm from "../components/CotizacionRegisterForm";

export default function CreateCotizacionPage(props) {
  return (
    <div className="w-full flex justify-center">
      <CotizacionRegisterForm {...props} />
    </div>
  );
}
