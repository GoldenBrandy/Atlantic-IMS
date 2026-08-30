import ProductoRegisterForm from "../components/ProductoRegisterForm";

export default function CreateProductoPage(props) {
  return (
    <div className="w-full flex justify-center">
      <ProductoRegisterForm {...props} />
    </div>
  );
}
