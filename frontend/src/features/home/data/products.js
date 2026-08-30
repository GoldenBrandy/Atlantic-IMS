import laptop from "@/assets/images/products/card-laptop.png";
import monitor from "@/assets/images/products/card-monitor.png";
import mouse from "@/assets/images/products/card-mouse.png";
import teclado from "@/assets/images/products/card-teclado.png";

export const products = [
  {
    id: 1,
    tittle: "Laptop Gamer",
    price: 4300000,
    description:
      "Laptop Gamer con procesador Intel Core i7, 16GB de RAM y tarjeta gráfica NVIDIA GeForce RTX 3060.",
    image: laptop,
    category: "Electrónica",
  },
  {
    id: 2,
    tittle: "Monitor Curvo",
    price: 1200000,
    description:
      "Monitor Curvo de 27 pulgadas con resolución QHD y tasa de refresco de 144Hz.",
    image: monitor,
    category: "Electrónica",
  },
  {
    id: 3,
    tittle: "Mouse Inalámbrico",
    price: 80000,
    description:
      "Mouse Inalámbrico con sensor óptico de alta precisión y diseño ergonómico.",
    image: mouse,
    category: "Accesorios",
  },
  {
    id: 4,
    tittle: "Teclado Mecánico",
    price: 250000,
    description:
      "Teclado Mecánico con retroiluminación RGB y switches de alta durabilidad.",
    image: teclado,
    category: "Accesorios",
  },
];
