import { Link } from "react-router-dom";
import { useResumenPedidos } from "../hooks/usePedidos";
import { AdminNav, PageHeading } from "../../../shared/layout/MainLayout";
import { Card, money } from "../../../shared/ui";
import { EstadoError } from "../../../shared/components/States";
export function AdminResumenPage() {
  const query = useResumenPedidos();
  return (
    <>
      <AdminNav />
      <PageHeading
        eyebrow="ADMINISTRACIÓN"
        title="El negocio, de un vistazo"
        description="Los números que acompañan cada buena decisión."
      />
      {query.isPending ? (
        <p role="status">Cargando resumen…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(
              [
                ["Pedidos de hoy", query.data.pedidos_hoy, "Actividad del día"],
                ["Pendientes", query.data.pendientes, "Esperando preparación"],
                [
                  "En preparación",
                  query.data.en_preparacion,
                  "En nuestra cocina",
                ],
                ["Entregados", query.data.entregados, "Pedidos completados"],
                ["Cancelados", query.data.cancelados, "Stock restituido"],
                [
                  "Ingresos entregados",
                  money(query.data.ingresos_entregados),
                  "Acumulado de pedidos entregados",
                ],
              ] as const
            ).map(([label, value, caption], i) => (
              <Card
                key={label}
                className={`p-6 ${i === 5 ? "metric-feature" : ""}`}
              >
                <p className="text-sm opacity-70">{label}</p>
                <p className="text-4xl font-bold my-5 tracking-tight">
                  {value}
                </p>
                <p className="text-xs opacity-60">{caption}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-7 p-7 flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold">
                La cocina sigue en movimiento.
              </h2>
              <p className="mt-2 text-stone-500">
                Revisá los pedidos pendientes y actualizá su estado.
              </p>
            </div>
            <Link to="/admin/pedidos" className="btn">
              Gestionar pedidos →
            </Link>
          </Card>
        </>
      )}
    </>
  );
}
