import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriasApi } from "../api/categorias";
import type { Categoria } from "../types";
import { Modal, Button, FieldError } from "../../../shared/ui";
import { handleApiError } from "../../../shared/api/handleApiError";
export function CategoriaForm({
  categoria,
  onClose,
}: {
  categoria: Categoria | null;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: categoriasApi.create });
  const update = useMutation({
    mutationFn: (value: { nombre: string; descripcion: string }) =>
      categoriasApi.update(categoria!.id, value),
  });
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre || "",
      descripcion: categoria?.descripcion || "",
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        if (categoria) await update.mutateAsync(value);
        else await mutation.mutateAsync(value);
        await client.invalidateQueries({ queryKey: ["categorias"] });
        await client.invalidateQueries({ queryKey: ["productos"] });
        onClose();
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });
  return (
    <Modal
      title={categoria ? "Editar categoría" : "Nueva categoría"}
      onClose={onClose}
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2 || value.length > 100
                ? "Ingresá entre 2 y 100 caracteres"
                : undefined,
          }}
        >
          {(field) => (
            <label className="field">
              Nombre
              <input
                className="input"
                autoFocus
                minLength={2}
                maxLength={100}
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <FieldError errors={field.state.meta.errors} />
            </label>
          )}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => (
            <label className="field">
              Descripción
              <textarea
                className="input"
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </label>
          )}
        </form.Field>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar categoría"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  );
}
