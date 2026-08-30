import { Outlet, Link } from 'react-router-dom';
import heroBg from "@/assets/images/Fondo1.png";
import logo_1 from "@/assets/images/logo_1.png";

export default function AuthLayout() {
    return (
        <div className="relative min-h-screen text-text-primary">
            <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
            <Link to="/" className="absolute left-6 top-6">
                <img src={logo_1} alt="Logo" className="h-26" />
            </Link>
            <main className="relative flex min-h-screen items-center justify-center p-6">
                <Outlet />
            </main>
        </div>
    );
}