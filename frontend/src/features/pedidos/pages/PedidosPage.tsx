import { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePedidos, usePedidoMutation } from "../hooks/usePedidos";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { AdminPedidosTable } from "../components/AdminPedidosTable";
import { estados, etiquetaEstado } from "../types";
import type { EstadoPedido } from "../types";
import { useAuthStore } from "../../../store/authStore";
import { PageHeading, AdminNav } from "../../../shared/layout/MainLayout";
import { BadgeEstado, Button, Card, money } from "../../../shared/ui";
import {
  EstadoError,
  EstadoVacio,
  Paginacion,
} from "../../../shared/components/States";
export function PedidosPage({ admin = false }: { admin?: boolean }) {
  const [page, setPage] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido>();
  const [detail, setDetail] = useState<number>();
  const query = usePedidos(page * 20, estado);
  const mutation = usePedidoMutation();
  const usuario = useAuthStore((s) => s.usuario);
  const location = useLocation();
  async function change(id: number, next?: EstadoPedido) {
    if (
      !window.confirm(
        next === "CANCELADO" || !next
          ? "¿Cancelar este pedido? Se restituirá su stock."
          : "¿Confirmar el cambio de estado?",
      )
    )
      return;
    try {
      await mutation.mutateAsync({ id, estado: next });
    } catch {
      /* El error se presenta debajo. */
    }
  }
  return (
    <>
      {admin && <AdminNav />}
      <PageHeading
        eyebrow={admin ? "ADMINISTRACIÓN" : "HECHOS PARA VOS"}
        title={admin ? "Gestión de pedidos" : "Mis pedidos"}
        description={
          admin
            ? "Acompañá cada pedido, de la cocina a la entrega."
            : "Consultá el estado y los detalles de tus pedidos."
        }
      />
      {!admin &&
        typeof location.state === "object" &&
        location.state &&
        "pedidoCreado" in location.state && (
          <p className="success mb-5" role="status">
            ¡Recibimos tu pedido! Podés seguirlo desde acá.
          </p>
        )}
      {!admin && usuario?.role === "admin" && (
        <p className="notice mb-5">
          Tu rol de administrador permite consultar todos los pedidos del
          negocio.
        </p>
      )}
      <label className="field max-w-xs mb-6">
        Filtrar por estado
        <select
          className="input"
          value={estado || ""}
          onChange={(e) => {
            setEstado(
              e.target.value ? (e.target.value as EstadoPedido) : undefined,
            );
            setPage(0);
          }}
        >
          <option value="">Todos los estados</option>
          {estados.map((s) => (
            <option key={s} value={s}>
              {etiquetaEstado(s)}
            </option>
          ))}
        </select>
      </label>
      {mutation.isError && <EstadoError error={mutation.error} />}
      {query.isPending ? (
        <p role="status" className="empty">
          Cargando pedidos…
        </p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : !query.data.items.length ? (
        <>
          <EstadoVacio
            title="No hay pedidos para mostrar"
            description={
              page > 0
                ? "Los resultados cambiaron. Volvé a la primera página para consultar los pedidos disponibles."
                : "Los pedidos aparecerán acá una vez confirmados."
            }
          />
          {page > 0 && (
            <Button className="btn-secondary mt-5" onClick={() => setPage(0)}>
              Volver a la primera página
            </Button>
          )}
        </>
      ) : (
        <>
          {admin ? (
            <AdminPedidosTable
              pedidos={query.data.items}
              busy={mutation.isPending}
              onDetail={setDetail}
              onChange={(id, next) => void change(id, next)}
            />
          ) : (
            <div className="space-y-4">
              {query.data.items.map((pedido) => (
                <Card className="p-5 md:p-6" key={pedido.id}>
                  <div className="flex flex-wrap justify-between gap-5">
                    <div>
                      <div className="flex gap-3 items-center">
                        <h2 className="text-xl font-bold">
                          Pedido #{pedido.id}
                        </h2>
                        <BadgeEstado estado={pedido.estado} />
                      </div>
                      <p className="mt-3 text-sm text-stone-500">
                        {new Date(pedido.created_at).toLocaleString("es-AR")}
                        {admin ? ` · Cliente #${pedido.usuario_id}` : ""}
                      </p>
                      <p className="text-sm mt-2">
                        {pedido.items.reduce((sum, i) => sum + i.cantidad, 0)}{" "}
                        unidades · {pedido.direccion_entrega}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-4">
                      <strong className="text-xl">{money(pedido.total)}</strong>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="btn-secondary btn-small"
                          onClick={() => setDetail(pedido.id)}
                        >
                          Ver detalle
                        </Button>
                        {admin && pedido.estado === "PENDIENTE" && (
                          <Button
                            className="btn-small"
                            disabled={mutation.isPending}
                            onClick={() =>
                              void change(pedido.id, "EN_PREPARACION")
                            }
                          >
                            Preparar
                          </Button>
                        )}
                        {admin && pedido.estado === "EN_PREPARACION" && (
                          <Button
                            className="btn-small"
                            disabled={mutation.isPending}
                            onClick={() => void change(pedido.id, "ENTREGADO")}
                          >
                            Entregar
                          </Button>
                        )}
                        {((admin &&
                          ["PENDIENTE", "EN_PREPARACION"].includes(
                            pedido.estado,
                          )) ||
                          (!admin &&
                            pedido.usuario_id === usuario?.id &&
                            pedido.estado === "PENDIENTE")) && (
                          <Button
                            className="btn-danger btn-small"
                            disabled={mutation.isPending}
                            onClick={() =>
                              void change(
                                pedido.id,
                                admin ? "CANCELADO" : undefined,
                              )
                            }
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Paginacion page={page} total={query.data.total} onChange={setPage} />
        </>
      )}
      {detail !== undefined && (
        <PedidoDetalle id={detail} onClose={() => setDetail(undefined)} />
      )}
    </>
  );
}
