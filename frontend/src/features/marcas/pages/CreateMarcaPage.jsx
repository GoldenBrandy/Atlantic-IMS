import MarcaRegisterForm from "../components/MarcaRegisterForm";

export default function CreateMarcaPage(props) {
  return (
    <div className="w-full flex justify-center">
      <MarcaRegisterForm {...props} />
    </div>
  );
}