import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { CarritoPage } from "../features/pedidos/pages/CarritoPage";
import { CheckoutPage } from "../features/pedidos/pages/CheckoutPage";
import { PedidosPage } from "../features/pedidos/pages/PedidosPage";
import { AdminResumenPage } from "../features/pedidos/pages/AdminResumenPage";
import { AdminCategoriasPage } from "../features/categorias/pages/AdminCategoriasPage";
import { AdminProductosPage } from "../features/productos/pages/AdminProductosPage";
import { AdminUsuariosPage } from "../features/usuarios/pages/AdminUsuariosPage";
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<CatalogoPage />} />
          <Route path="login" element={<AuthPage key="login" />} />
          <Route
            path="register"
            element={<AuthPage key="register" register />}
          />
          <Route path="carrito" element={<CarritoPage />} />
          <Route
            path="unauthorized"
            element={
              <div className="empty">
                <h1 className="text-3xl font-bold">
                  No tenés permiso para entrar
                </h1>
                <p className="my-5">Esta sección requiere otro rol.</p>
                <Link to="/" className="btn">
                  Volver al inicio
                </Link>
              </div>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="mis-pedidos" element={<PedidosPage />} />
          </Route>
          <Route element={<ProtectedRoute admin />}>
            <Route
              path="admin"
              element={<Navigate to="/admin/resumen" replace />}
            />
            <Route path="admin/resumen" element={<AdminResumenPage />} />
            <Route path="admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="admin/productos" element={<AdminProductosPage />} />
            <Route path="admin/pedidos" element={<PedidosPage admin />} />
            <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="empty">
                <h1 className="text-3xl font-bold">
                  No encontramos esta página
                </h1>
                <Link className="btn mt-5" to="/">
                  Volver al menú
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
