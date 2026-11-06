import { useQuery } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidos";
import { BadgeEstado, money, Modal } from "../../../shared/ui";
import { EstadoError } from "../../../shared/components/States";
export function PedidoDetalle({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ["pedidos", "detalle", id],
    queryFn: () => pedidosApi.detail(id),
  });
  return (
    <Modal title={`Pedido #${id}`} onClose={onClose}>
      {query.isPending ? (
        <p role="status">Cargando detalle…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <BadgeEstado estado={query.data.estado} />
          <dl className="detail-grid my-6">
            <dt>Fecha</dt>
            <dd>{new Date(query.data.created_at).toLocaleString("es-AR")}</dd>
            <dt>Entrega</dt>
            <dd>{query.data.direccion_entrega}</dd>
            <dt>Pago</dt>
            <dd>
              {query.data.forma_pago === "EFECTIVO"
                ? "Efectivo"
                : "Transferencia"}
            </dd>
            {query.data.notas && (
              <>
                <dt>Notas</dt>
                <dd>{query.data.notas}</dd>
              </>
            )}
          </dl>
          <div className="space-y-3">
            {query.data.items.map((item) => (
              <div
                className="flex justify-between gap-4 border-b border-stone-100 pb-3"
                key={item.producto_id}
              >
                <div>
                  <strong>
                    {item.cantidad} ? {item.nombre_producto}
                  </strong>
                  <p className="text-xs text-stone-500">
                    {money(item.precio_unitario)} por unidad
                  </p>
                </div>
                <strong>{money(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-5 text-xl font-bold">
            <span>Total</span>
            <span>{money(query.data.total)}</span>
          </div>
        </>
      )}
    </Modal>
  );
}
