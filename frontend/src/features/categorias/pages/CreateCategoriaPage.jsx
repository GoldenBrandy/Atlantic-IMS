import CategoriaRegisterForm from "../components/CategoriaRegisterForm";

export default function CreateCategoriaPage(props) {
  return (
    <div className="w-full flex justify-center">
      <CategoriaRegisterForm {...props} />
    </div>
  );
}
