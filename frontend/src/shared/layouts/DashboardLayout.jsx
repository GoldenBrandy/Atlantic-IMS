import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared";

export default function DashboardLayout() {
    return (
        <div className="relative h-screen w-full flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}