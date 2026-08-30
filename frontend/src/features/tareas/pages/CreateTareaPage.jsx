import TareaRegisterForm from "../components/TareaRegisterForm";

export default function CreateTareaPage(props) {
  return (
    <div className="w-full flex justify-center">
      <TareaRegisterForm {...props} />
    </div>
  );
}
