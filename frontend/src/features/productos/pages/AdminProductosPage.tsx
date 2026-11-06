import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useProductos } from "../hooks/useProductos";
import { productosApi } from "../api/productos";
import type { Producto } from "../types";
import { ProductoForm } from "../components/ProductoForm";
import { AdminNav, PageHeading } from "../../../shared/layout/MainLayout";
import { Button, money } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError, Paginacion } from "../../../shared/components/States";
export function AdminProductosPage() {
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState(0);
  const query = useProductos({ limit: 100, skip: batch * 100, search });
  const client = useQueryClient();
  const [editing, setEditing] = useState<Producto | null | undefined>();
  const [stockOnly, setStockOnly] = useState(false);
  const mutation = useMutation({
    mutationFn: productosApi.remove,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["productos"] });
    },
  });
  const columns: ColumnDef<Producto, unknown>[] = [
    { accessorKey: "nombre", header: "Producto" },
    {
      id: "categoria",
      header: "Categoría",
      cell: ({ row }) => row.original.categoria.nombre,
    },
    {
      accessorKey: "precio_base",
      header: "Precio",
      cell: ({ row }) => money(row.original.precio_base),
    },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "disponible",
      header: "Venta",
      cell: ({ row }) => (row.original.disponible ? "Disponible" : "Pausada"),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            className="btn-secondary btn-small"
            onClick={() => {
              setStockOnly(false);
              setEditing(row.original);
            }}
          >
            Editar
          </Button>
          <Button
            className="btn-secondary btn-small"
            onClick={() => {
              setStockOnly(true);
              setEditing(row.original);
            }}
          >
            Stock
          </Button>
          <Button
            className="btn-danger btn-small"
            disabled={mutation.isPending}
            onClick={() => {
              if (window.confirm("¿Dar de baja este producto?"))
                mutation.mutate(row.original.id);
            }}
          >
            Baja
          </Button>
        </div>
      ),
    },
  ];
  return (
    <>
      <AdminNav />
      <PageHeading
        eyebrow="ADMINISTRACIÓN"
        title="Productos"
        description="Cuidá cada detalle del menú y mantené el stock al día."
      >
        <Button
          onClick={() => {
            setStockOnly(false);
            setEditing(null);
          }}
        >
          + Nuevo producto
        </Button>
      </PageHeading>
      <label className="field max-w-sm mb-5">
        Buscar
        <input
          className="input"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setBatch(0);
          }}
          placeholder="Nombre del producto"
        />
      </label>
      {mutation.isError && <EstadoError error={mutation.error} />}
      {query.isPending ? (
        <p role="status">Cargando productos…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <DataTable data={query.data.items} columns={columns} />
          {batch > 0 && !query.data.items.length ? (
            <div className="mt-5">
              <p className="text-sm text-stone-500 mb-3">
                Los productos disponibles cambiaron. Volvé al primer grupo.
              </p>
              <Button className="btn-secondary" onClick={() => setBatch(0)}>
                Volver al primer grupo
              </Button>
            </div>
          ) : (
            query.data.total > 100 && (
              <>
                <p className="text-xs text-stone-500 mt-4">
                  Cada grupo contiene hasta 100 productos y se pagina en la
                  tabla.
                </p>
                <Paginacion
                  page={batch}
                  total={query.data.total}
                  size={100}
                  onChange={setBatch}
                />
              </>
            )
          )}
        </>
      )}
      {editing !== undefined && (
        <ProductoForm
          producto={editing}
          stockOnly={stockOnly}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
