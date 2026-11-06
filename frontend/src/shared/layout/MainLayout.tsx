import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui";
import { handleApiError } from "../api/handleApiError";
export function MainLayout() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function salir() {
    setBusy(true);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="site-header">
        <nav
          className="shell flex flex-wrap items-center gap-x-7 gap-y-3 py-4"
          aria-label="Principal"
        >
          <Link to="/" className="brand">
            <span className="brand-icon">f.</span> food store
            <span className="brand-dot">●</span>
          </Link>
          <div className="flex flex-1 gap-6 text-sm font-semibold">
            <NavLink to="/" end>
              Menú
            </NavLink>
            {usuario && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
            {usuario?.role === "admin" && (
              <NavLink to="/admin/resumen">Administración</NavLink>
            )}
          </div>
          <Link to="/carrito" className="cart-link">
            Carrito <span>{items.reduce((sum, i) => sum + i.cantidad, 0)}</span>
          </Link>
          {usuario ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500">
                {usuario.full_name}
                <br />
                <strong>
                  {usuario.role === "admin" ? "Administrador" : "Cliente"}
                </strong>
              </span>
              <Button
                className="btn-secondary btn-small"
                disabled={busy}
                onClick={() => void salir()}
              >
                Salir
              </Button>
            </div>
          ) : (
            <Link className="btn btn-small" to="/login">
              Ingresar →
            </Link>
          )}
        </nav>
      </header>
      {error && (
        <p className="shell error mt-3" role="alert">
          {error}
        </p>
      )}
      <main className="shell py-8 md:py-12">
        <Outlet />
      </main>
      <footer className="shell footer">
        <span className="font-bold">food store.</span>
        <span>Buena comida. Buenos momentos.</span>
        <span>Programación IV · UTN</span>
      </footer>
    </>
  );
}
export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Administración">
      {[
        ["resumen", "Resumen"],
        ["categorias", "Categorías"],
        ["productos", "Productos"],
        ["pedidos", "Pedidos"],
        ["usuarios", "Usuarios"],
      ].map(([path, label]) => (
        <NavLink key={path} to={`/admin/${path}`}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="mt-2 text-stone-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}
