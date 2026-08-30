import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { Toaster } from "sileo";

export default function App() {
  return (
    <>
      <Toaster position="top-center" options={{ duration: 5000 }} />
      <RouterProvider router={router} />
    </>
  );
}