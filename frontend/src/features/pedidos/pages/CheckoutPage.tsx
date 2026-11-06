import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../../store/cartStore";
import { pedidosApi } from "../api/pedidos";
import type { FormaPago } from "../types";
import { PageHeading } from "../../../shared/layout/MainLayout";
import { Button, Card, FieldError, money } from "../../../shared/ui";
import { EstadoVacio } from "../../../shared/components/States";
import { handleApiError } from "../../../shared/api/handleApiError";
export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: pedidosApi.create });
  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await mutation.mutateAsync({
          ...value,
          notas: value.notas || null,
          items: items.map(({ producto_id, cantidad }) => ({
            producto_id,
            cantidad,
          })),
        });
        vaciar();
        await Promise.all(
          ["productos", "pedidos", "resumen"].map((key) =>
            client.invalidateQueries({ queryKey: [key] }),
          ),
        );
        navigate("/mis-pedidos", { state: { pedidoCreado: true } });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });
  if (!items.length)
    return (
      <>
        <EstadoVacio title="Necesitás agregar productos para pedir" />
        <Link className="btn" to="/">
          Volver al menú
        </Link>
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="YA CASI ESTAMOS"
        title="Confirmá tu pedido"
        description="Contanos dónde lo llevamos y cómo vas a pagar."
      />
      <div className="checkout-grid">
        <Card className="p-7">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 5 || value.length > 200
                    ? "Ingresá entre 5 y 200 caracteres"
                    : undefined,
              }}
            >
              {(field) => (
                <label className="field">
                  Dirección de entrega
                  <input
                    className="input"
                    placeholder="Calle, número, piso y departamento"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    minLength={5}
                    maxLength={200}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </label>
              )}
            </form.Field>
            <form.Field name="forma_pago">
              {(field) => (
                <label className="field">
                  Forma de pago
                  <select
                    className="input"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                  <span className="text-xs text-stone-500">
                    El pago se coordina de forma manual con el negocio.
                  </span>
                </label>
              )}
            </form.Field>
            <form.Field name="notas">
              {(field) => (
                <label className="field">
                  Notas para el pedido{" "}
                  <span className="font-normal text-stone-400">(opcional)</span>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Algo que debamos saber…"
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
                  {isSubmitting ? "Confirmando…" : "Confirmar pedido →"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>
        <Card className="p-6 h-fit summary-card">
          <p className="eyebrow">TU PEDIDO</p>
          <div className="my-5 space-y-3">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.cantidad} ? {item.nombre}
                </span>
                <strong>{money(item.cantidad * item.precio_unitario)}</strong>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-5">
            <strong>Total estimado</strong>
            <strong>{money(total())}</strong>
          </div>
          <p className="text-xs text-stone-500 mt-4">
            El total final se calcula con los precios vigentes al confirmar.
          </p>
        </Card>
      </div>
    </>
  );
}
