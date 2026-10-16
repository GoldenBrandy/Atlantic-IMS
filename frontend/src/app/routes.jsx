import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout, DashboardLayout } from "@/shared";
import {  ForgotPassword, RequestAccess } from "@/features/auth";
import { CreateUserPage, ListUserPage, EditUserPage, ProfilePage, ForcePasswordChangePage } from "@/features/users";
import { DashboardHomePage } from "@/features/dashboard";
import { AccessPage } from "@/features/access";
import { ListMaterialPage, CreateMaterialPage, EditMaterialPage } from '@/features/materiales';
import { CreateGrupoPage, ListGruposPage, EditGrupoPage } from '@/features/grupos';
import { CreateProductoPage, ListProductosPage, EditProductoPage } from '@/features/productos';
import { CreateMarcaPage, ListMarcasPage, EditMarcaPage } from '@/features/marcas';
import { CreateTareaPage, ListTareasPage, EditTareaPage, MisTareasPage } from '@/features/tareas';
import { CreatePrestamoPage, ListPrestamosPage, EditPrestamoPage, PrestamoTicketPage, ConfirmIdentityPage } from '@/features/prestamos';
import { CreateDevolucionPage } from '@/features/devoluciones';
import { ListInventariosPage, CreateInventarioPage, EditInventarioPage } from '@/features/inventarios';
import { ListReportesPage } from '@/features/reportes';
import { ListHistorialPage } from '@/features/historial';
import { LoginRoute, RequireAuth, RequireSuperUser, RequirePermission } from "./routerGuards";
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
            {path: "forgot-password", element: <ForgotPassword />},
            {path: "solicitar-registro", element: <RequestAccess />},
            {path: "confirmar-identidad/:prestamoId", element: <ConfirmIdentityPage />},
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
            {
                path: "permisos",
                element: (
                    <RequireSuperUser>
                        <AccessPage />
                    </RequireSuperUser>
                ),
            },
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
            {
                path: "usuarios/crear",
                element: (
                    <RequirePermission permission="create_users">
                        <CreateUserPage />
                    </RequirePermission>
                ),
            },
            { path: "perfil", element: <ProfilePage /> },
            { path: "mis-tareas", element: <MisTareasPage /> },
            { path: "cambiar-contrasena", element: <ForcePasswordChangePage /> },
            {
                path: "permisos",
                element: (
                    <RequireSuperUser>
                        <AccessPage />
                    </RequireSuperUser>
                ),
            },
            {
                path: "userList",
                element: (
                    <RequirePermission permission="list_users">
                        <ListUserPage />
                    </RequirePermission>
                ),
            },
            {
                path: "users",
                element: (
                    <RequirePermission permission="list_users">
                        <ListUserPage />
                    </RequirePermission>
                ),
            },
            {
                path: "users/:id/edit",
                element: (
                    <RequireSuperUser>
                        <EditUserPage />
                    </RequireSuperUser>
                ),
            },
            {
                path: "materiales",
                element: (
                    <RequirePermission permission="list_materiales">
                        <ListMaterialPage />
                    </RequirePermission>
                ),
            },
            {
                path: "materiales/crear",
                element: (
                    <RequirePermission permission="create_materiales">
                        <CreateMaterialPage />
                    </RequirePermission>
                ),
            },
            {
                path: "materiales/:id/edit",
                element: (
                    <RequirePermission permission="edit_materiales">
                        <EditMaterialPage />
                    </RequirePermission>
                ),
            },
            {
                path: "grupos",
                element: (
                    <RequirePermission permission="list_grupos_aprendices">
                        <ListGruposPage />
                    </RequirePermission>
                ),
            },
            {
                path: "grupos/crear",
                element: (
                    <RequirePermission permission="create_grupos_aprendices">
                        <CreateGrupoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "grupos/:id/edit",
                element: (
                    <RequirePermission permission="edit_grupos_aprendices">
                        <EditGrupoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "productos",
                element: (
                    <RequirePermission permission="list_productos">
                        <ListProductosPage />
                    </RequirePermission>
                ),
            },
            {
                path: "productos/crear",
                element: (
                    <RequirePermission permission="create_productos">
                        <CreateProductoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "productos/:id/edit",
                element: (
                    <RequirePermission permission="edit_productos">
                        <EditProductoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "marcas",
                element: (
                    <RequirePermission permission="list_marcas">
                        <ListMarcasPage />
                    </RequirePermission>
                ),
            },
            {
                path: "marcas/crear",
                element: (
                    <RequirePermission permission="create_marcas">
                        <CreateMarcaPage />
                    </RequirePermission>
                ),
            },
            {
                path: "marcas/:id/edit",
                element: (
                    <RequirePermission permission="edit_marcas">
                        <EditMarcaPage />
                    </RequirePermission>
                ),
            },
            {
                path: "tareas",
                element: (
                    <RequirePermission permission="list_tareas">
                        <ListTareasPage />
                    </RequirePermission>
                ),
            },
            {
                path: "tareas/crear",
                element: (
                    <RequirePermission permission="create_tareas">
                        <CreateTareaPage />
                    </RequirePermission>
                ),
            },
            {
                path: "tareas/:id/edit",
                element: (
                    <RequirePermission permission="edit_tareas">
                        <EditTareaPage />
                    </RequirePermission>
                ),
            },
            {
                path: "prestamos",
                element: (
                    <RequirePermission permission="list_prestamos">
                        <ListPrestamosPage />
                    </RequirePermission>
                ),
            },
            {
                path: "prestamos/crear",
                element: (
                    <RequirePermission permission="create_prestamos">
                        <CreatePrestamoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "prestamos/:id/edit",
                element: (
                    <RequirePermission permission="edit_prestamos">
                        <EditPrestamoPage />
                    </RequirePermission>
                ),
            },
            {
                path: "prestamos/:id/ticket",
                element: (
                    <RequirePermission permission="list_prestamos">
                        <PrestamoTicketPage />
                    </RequirePermission>
                ),
            },
            {
                path: "devoluciones/crear",
                element: (
                    <RequirePermission permission="create_devoluciones">
                        <CreateDevolucionPage />
                    </RequirePermission>
                ),
            },
            {
                path: "inventarios",
                element: (
                    <RequirePermission permission="list_inventarios">
                        <ListInventariosPage />
                    </RequirePermission>
                ),
            },
            {
                path: "inventarios/crear",
                element: (
                    <RequirePermission permission="create_inventarios">
                        <CreateInventarioPage />
                    </RequirePermission>
                ),
            },
            {
                path: "inventarios/:id/edit",
                element: (
                    <RequirePermission permission="edit_inventarios">
                        <EditInventarioPage />
                    </RequirePermission>
                ),
            },
            {
                path: "reportes",
                element: (
                    <RequirePermission permission="generate_reports">
                        <ListReportesPage />
                    </RequirePermission>
                ),
            },
            {
                path: "historial",
                element: (
                    <RequireSuperUser>
                        <ListHistorialPage />
                    </RequireSuperUser>
                ),
            },
        ],
    },
]);

export default router;