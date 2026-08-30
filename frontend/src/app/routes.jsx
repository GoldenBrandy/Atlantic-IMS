import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import { ForgotPassword, ResetPassword } from "@/features/auth";
import { CreateUserPage, ListUserPage, EditUserPage, ProfilePage } from "@/features/users";
import { DashboardHomePage } from "@/features/dashboard";
import { AccessPage } from "@/features/access";
import { ListMaterialPage, CreateMaterialPage, EditMaterialPage } from '@/features/materiales';
import { CreateGrupoPage, ListGruposPage, EditGrupoPage } from '@/features/grupos';
import { CreateProductoPage, ListProductosPage, EditProductoPage } from '@/features/productos';
import { CreateMarcaPage, ListMarcasPage, EditMarcaPage } from '@/features/marcas';
import { CreateTareaPage, ListTareasPage, EditTareaPage } from '@/features/tareas';
import { CreatePrestamoPage, ListPrestamosPage, EditPrestamoPage } from '@/features/prestamos';
import { CreateDevolucionPage } from '@/features/devoluciones';
import { ListReportesPage } from '@/features/reportes';
import { ListHistorialPage } from '@/features/historial';
import { LoginRoute, RequireAuth, RequireSuperUser } from "./routerGuards";
import RouteErrorBoundary from "./RouteErrorBoundary";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth" replace />,
    },
    {
        path: "/auth",
        element: <AuthLayout/>,
        errorElement: <RouteErrorBoundary />,
        children:[
            {index: true, element: <LoginRoute />},
            {path: "recuperar", element: <ForgotPassword />},
            {path: "restablecer", element: <ResetPassword />},
        ],
    },
    {
        path:"/dashboard-layout",
        element: (
            <RequireAuth>
                <DashboardLayout />
            </RequireAuth>
        ),
        errorElement: <RouteErrorBoundary />,
        children: [
            { index: true,element: <h1></h1>},
            { path: "contacto" ,element: <h1> Contacto</h1>},
            { path: "productos",element: <h1> Productos</h1>},
            { path: "permisos", element: <AccessPage /> },
        ],
    },
    {
        path:"/dashboard",
        element: (
            <RequireAuth>
                <DashboardLayout />
            </RequireAuth>
        ),
        errorElement: <RouteErrorBoundary />,
        children: [
            { index: true, element: <DashboardHomePage /> },
            { path: "usuarios/crear", element: <CreateUserPage /> },
            { path: "perfil", element: <ProfilePage /> },
            { path: "userList", element: <ListUserPage /> },
            { path: "users", element: <ListUserPage /> },
            {
                path: "users/:id/edit",
                element: (
                    <RequireSuperUser>
                        <EditUserPage />
                    </RequireSuperUser>
                ),
            },
            { path: "permisos", element: <AccessPage /> },
            { path: "materiales", element: <ListMaterialPage /> },
            { path: "materiales/crear", element: <CreateMaterialPage /> },
            { path: "materiales/:id/edit", element: <EditMaterialPage /> },
            { path: "grupos", element: <ListGruposPage /> },
            { path: "grupos/crear", element: <CreateGrupoPage /> },
            { path: "grupos/:id/edit", element: <EditGrupoPage /> },
            { path: "productos", element: <ListProductosPage /> },
            { path: "productos/crear", element: <CreateProductoPage /> },
            { path: "productos/:id/edit", element: <EditProductoPage /> },
            { path: "marcas", element: <ListMarcasPage /> },
            { path: "marcas/crear", element: <CreateMarcaPage /> },
            { path: "marcas/:id/edit", element: <EditMarcaPage /> },
            { path: "tareas", element: <ListTareasPage /> },
            { path: "tareas/crear", element: <CreateTareaPage /> },
            { path: "tareas/:id/edit", element: <EditTareaPage /> },
            { path: "prestamos", element: <ListPrestamosPage /> },
            { path: "prestamos/crear", element: <CreatePrestamoPage /> },
            { path: "prestamos/:id/edit", element: <EditPrestamoPage /> },
            { path: "devoluciones/crear", element: <CreateDevolucionPage /> },
            { path: "reportes", element: <ListReportesPage /> },
            { path: "historial", element: <RequireSuperUser>
                <ListHistorialPage />
            </RequireSuperUser> }
        ],
    },
]);

export default router;