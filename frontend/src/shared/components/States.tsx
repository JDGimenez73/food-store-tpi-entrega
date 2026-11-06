import { handleApiError } from "../api/handleApiError";
import { Button } from "../ui";
export function Skeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Cargando"
      role="status"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card overflow-hidden">
          <div className="h-48 animate-pulse bg-stone-200" />
          <div className="p-5 space-y-4">
            <div className="h-5 w-2/3 animate-pulse bg-stone-200 rounded" />
            <div className="h-3 animate-pulse bg-stone-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function EstadoVacio({
  title = "Todavía no hay resultados",
  description = "Probá con otros filtros o volvé más tarde.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty">
      <span className="text-4xl" aria-hidden="true">
        ●
      </span>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-stone-500">{description}</p>
    </div>
  );
}
export function EstadoError({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  return (
    <div className="error" role="alert">
      <p>{handleApiError(error)}</p>
      {retry && (
        <Button className="btn-secondary mt-3" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function Paginacion({
  page,
  total,
  size = 20,
  onChange,
}: {
  page: number;
  total: number;
  size?: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <nav className="pagination" aria-label="Paginación">
      <Button
        className="btn-secondary"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ← Anterior
      </Button>
      <span>
        Página {page + 1} de {pages} · {total} resultados
      </span>
      <Button
        className="btn-secondary"
        disabled={page + 1 >= pages}
        onClick={() => onChange(page + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  );
}
