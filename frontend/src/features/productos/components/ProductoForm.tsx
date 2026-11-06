import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productosApi } from "../api/productos";
import type { Producto, ProductoInput } from "../types";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { Modal, Button, FieldError } from "../../../shared/ui";
import { handleApiError } from "../../../shared/api/handleApiError";
export function ProductoForm({
  producto,
  onClose,
  stockOnly = false,
}: {
  producto: Producto | null;
  onClose: () => void;
  stockOnly?: boolean;
}) {
  const [error, setError] = useState("");
  const categorias = useCategorias();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (value: ProductoInput) =>
      stockOnly && producto
        ? productosApi.stock(producto.id, value.stock, value.disponible)
        : producto
          ? productosApi.update(producto.id, value)
          : productosApi.create(value),
  });
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre || "",
      descripcion: producto?.descripcion || "",
      precio_base: producto?.precio_base || 0,
      imagen_url: producto?.imagen_url || "",
      categoria_id: producto?.categoria_id || 0,
      stock: producto?.stock || 0,
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await mutation.mutateAsync(value);
        await client.invalidateQueries({ queryKey: ["productos"] });
        onClose();
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });
  return (
    <Modal
      title={
        stockOnly
          ? "Stock y disponibilidad"
          : producto
            ? "Editar producto"
            : "Nuevo producto"
      }
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        {!stockOnly && (
          <>
            <form.Field
              name="nombre"
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "El nombre es obligatorio" : undefined,
              }}
            >
              {(field) => (
                <label className="field">
                  Nombre
                  <input
                    className="input"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                    rows={2}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </label>
              )}
            </form.Field>
            <form.Field
              name="categoria_id"
              validators={{
                onChange: ({ value }) =>
                  value < 1 ? "Elegí una categoría activa" : undefined,
              }}
            >
              {(field) => (
                <label className="field">
                  Categoría
                  <select
                    className="input"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  >
                    <option value={0}>Seleccionar categoría</option>
                    {producto &&
                      !categorias.data?.some(
                        (c) => c.id === producto.categoria_id,
                      ) && (
                        <option value={producto.categoria_id} disabled>
                          {producto.categoria.nombre} (inactiva: elegí otra)
                        </option>
                      )}
                    {categorias.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={field.state.meta.errors} />
                  {categorias.isError && (
                    <span className="field-error">
                      No se pudieron cargar las categorías.
                    </span>
                  )}
                </label>
              )}
            </form.Field>
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  !Number.isFinite(value) || value < 0
                    ? "Ingresá un precio válido"
                    : undefined,
              }}
            >
              {(field) => (
                <label className="field">
                  Precio (ARS)
                  <input
                    className="input"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </label>
              )}
            </form.Field>
            <form.Field name="imagen_url">
              {(field) => (
                <label className="field">
                  URL de imagen
                  <input
                    className="input"
                    type="url"
                    placeholder="https://..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </label>
              )}
            </form.Field>
          </>
        )}
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !Number.isInteger(value) || value < 0
                ? "El stock debe ser un entero mayor o igual a cero"
                : undefined,
          }}
        >
          {(field) => (
            <label className="field">
              Stock
              <input
                className="input"
                type="number"
                min={0}
                step={1}
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              <FieldError errors={field.state.meta.errors} />
            </label>
          )}
        </form.Field>
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
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
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Modal>
  );
}
