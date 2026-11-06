import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { usuariosApi } from "../api/usuarios";
import type { UserPublic } from "../../auth/types";
import { useAuthStore } from "../../../store/authStore";
import { AdminNav, PageHeading } from "../../../shared/layout/MainLayout";
import { Button } from "../../../shared/ui";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/States";
export function AdminUsuariosPage() {
  const query = useQuery({ queryKey: ["usuarios"], queryFn: usuariosApi.list });
  const client = useQueryClient();
  const usuario = useAuthStore((s) => s.usuario);
  const mutation = useMutation({
    mutationFn: ({ id, disabled }: { id: number; disabled: boolean }) =>
      usuariosApi.estado(id, disabled),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
  const columns: ColumnDef<UserPublic, unknown>[] = [
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "full_name", header: "Nombre" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) =>
        row.original.role === "admin" ? "Administrador" : "Cliente",
    },
    {
      accessorKey: "disabled",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`badge ${row.original.disabled ? "badge-CANCELADO" : "badge-ENTREGADO"}`}
        >
          {row.original.disabled ? "Desactivado" : "Activo"}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) =>
        row.original.id === usuario?.id ? (
          <span className="text-xs text-stone-400">Tu cuenta</span>
        ) : (
          <Button
            className={`${row.original.disabled ? "btn-secondary" : "btn-danger"} btn-small`}
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                id: row.original.id,
                disabled: !row.original.disabled,
              })
            }
          >
            {row.original.disabled ? "Activar" : "Desactivar"}
          </Button>
        ),
    },
  ];
  return (
    <>
      <AdminNav />
      <PageHeading
        eyebrow="ADMINISTRACIÓN"
        title="Usuarios"
        description="Administrá el acceso de las cuentas del negocio."
      />
      {mutation.isError && <EstadoError error={mutation.error} />}
      {query.isPending ? (
        <p role="status">Cargando usuarios…</p>
      ) : query.isError ? (
        <EstadoError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <DataTable data={query.data} columns={columns} />
      )}
    </>
  );
}
