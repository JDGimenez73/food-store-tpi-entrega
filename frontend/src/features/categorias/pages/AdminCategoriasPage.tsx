import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useCategorias } from "../hooks/useCategorias";
import { categoriasApi } from "../api/categorias";
import type { Categoria } from "../types";
import { CategoriaForm } from "../components/CategoriaForm";
import { AdminNav, PageHeading } from "../../../shared/layout/MainLayout";
import { Button } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/States";
export function AdminCategoriasPage() {
  const query = useCategorias();
  const client = useQueryClient();
  const [editing, setEditing] = useState<Categoria | null | undefined>();
  const mutation = useMutation({
    mutationFn: categoriasApi.remove,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
  const columns: ColumnDef<Categoria, unknown>[] = [
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: (c) => String(c.getValue() || "—"),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            className="btn-secondary btn-small"
            onClick={() => setEditing(row.original)}
          >
            Editar
          </Button>
          <Button
            className="btn-danger btn-small"
            disabled={mutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "Se dará de baja la categoría. Sus productos seguirán activos. ¿Continuar?",
                )
              )
                mutation.mutate(row.original.id);
            }}
          >
            Dar de baja
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
        title="Categorías"
        description="Ordená el menú para que sea fácil encontrar cada favorito."
      >
        <Button onClick={() => setEditing(null)}>+ Nueva categoría</Button>
      </PageHeading>
      {mutation.isError && <EstadoError error={mutation.error} />}
      {query.isPending ? (
        <p role="status">Cargando categorías…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <DataTable data={query.data} columns={columns} />
      )}
      {editing !== undefined && (
        <CategoriaForm
          categoria={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
