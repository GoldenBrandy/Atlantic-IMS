import { Card } from "@/shared";
import { products } from "../data/products";

export default function HomePage() {
  return (
    <div className="mt-4 max-w-7xl mx-auto ">
      <h2 className="text-h2 place-self-center mb-12">Productos</h2>

      <div
        className="
            grid
            gap-4
            mx-6
            sm:grid-cols-2
            sm:mx-12
            lg:grid-cols-3
            xl:grid-cols-4
            justify-items-center
            "
      >
        {products.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
