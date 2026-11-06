import type { ColumnDef } from "@tanstack/react-table";
import type { EstadoPedido, Pedido } from "../types";
import { DataTable } from "../../../shared/components/DataTable";
import { BadgeEstado, Button, money } from "../../../shared/ui";

export function AdminPedidosTable({
  pedidos,
  busy,
  onDetail,
  onChange,
}: {
  pedidos: Pedido[];
  busy: boolean;
  onDetail: (id: number) => void;
  onChange: (id: number, estado: EstadoPedido) => void;
}) {
  const columns: ColumnDef<Pedido, unknown>[] = [
    {
      accessorKey: "id",
      header: "Pedido",
      cell: ({ row }) => `#${row.original.id}`,
    },
    { accessorKey: "usuario_id", header: "Cliente" },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleString("es-AR"),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => money(row.original.total),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row: { original: pedido } }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            className="btn-secondary btn-small"
            onClick={() => onDetail(pedido.id)}
          >
            Detalle
          </Button>
          {pedido.estado === "PENDIENTE" && (
            <Button
              className="btn-small"
              disabled={busy}
              onClick={() => onChange(pedido.id, "EN_PREPARACION")}
            >
              Preparar
            </Button>
          )}
          {pedido.estado === "EN_PREPARACION" && (
            <Button
              className="btn-small"
              disabled={busy}
              onClick={() => onChange(pedido.id, "ENTREGADO")}
            >
              Entregar
            </Button>
          )}
          {["PENDIENTE", "EN_PREPARACION"].includes(pedido.estado) && (
            <Button
              className="btn-danger btn-small"
              disabled={busy}
              onClick={() => onChange(pedido.id, "CANCELADO")}
            >
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ];
  return <DataTable data={pedidos} columns={columns} />;
}
