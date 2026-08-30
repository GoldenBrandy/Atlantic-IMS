import DevolucionRegisterForm from "../components/DevolucionRegisterForm";

export default function CreateDevolucionPage(props) {
  return (
    <div className="w-full flex justify-center">
      <DevolucionRegisterForm {...props} />
    </div>
  );
}