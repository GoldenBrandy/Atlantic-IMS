import PrestamoRegisterForm from "../components/PrestamoRegisterForm";

export default function CreatePrestamoPage(props) {
  return (
    <div className="w-full flex justify-center">
      <PrestamoRegisterForm {...props} />
    </div>
  );
}