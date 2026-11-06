import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
export function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { usuario, cargando } = useAuthStore();
  const location = useLocation();
  if (cargando)
    return (
      <p className="empty" role="status">
        Confirmando tu sesión…
      </p>
    );
  if (!usuario)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && usuario.role !== "admin")
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
