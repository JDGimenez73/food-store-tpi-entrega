import { Link } from "react-router-dom";
import { useCartStore } from "../../../store/cartStore";
import { PageHeading } from "../../../shared/layout/MainLayout";
import { Button, Card, money } from "../../../shared/ui";
import { EstadoVacio } from "../../../shared/components/States";
export function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore();
  return (
    <>
      <PageHeading
        eyebrow="TU PRÓXIMA COMIDA"
        title="Tu carrito"
        description="Un repaso antes de confirmar."
      />
      {!items.length ? (
        <>
          <EstadoVacio
            title="Tu carrito está esperando algo rico"
            description="Elegí tus favoritos del menú para empezar."
          />
          <Link className="btn mt-5" to="/">
            Ver menú →
          </Link>
        </>
      ) : (
        <div className="checkout-grid">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{items.length} productos</h2>
              <Button
                className="btn-ghost btn-small"
                onClick={() => {
                  if (window.confirm("¿Vaciar el carrito?")) vaciar();
                }}
              >
                Vaciar
              </Button>
            </div>
            {items.map((item) => (
              <div key={item.producto_id} className="cart-row">
                <div>
                  <h3 className="font-bold">{item.nombre}</h3>
                  <p className="text-sm text-stone-500">
                    {money(item.precio_unitario)} por unidad
                  </p>
                  <button
                    className="text-link text-xs mt-2"
                    onClick={() => quitar(item.producto_id)}
                  >
                    Quitar
                  </button>
                </div>
                <div className="quantity-control">
                  <button
                    aria-label={`Restar ${item.nombre}`}
                    disabled={item.cantidad <= 1}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                  >
                    −
                  </button>
                  <input
                    aria-label={`Cantidad de ${item.nombre}`}
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(event) =>
                      cambiarCantidad(
                        item.producto_id,
                        Number(event.target.value),
                      )
                    }
                  />
                  <button
                    aria-label={`Sumar ${item.nombre}`}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <strong>{money(item.cantidad * item.precio_unitario)}</strong>
              </div>
            ))}
            <Link className="text-link inline-block mt-6" to="/">
              ← Seguir eligiendo
            </Link>
          </Card>
          <Card className="p-6 h-fit summary-card">
            <p className="eyebrow">EL RESUMEN</p>
            <h2 className="text-2xl font-bold mt-3 mb-6">
              Todo listo para pedir
            </h2>
            <div className="flex justify-between border-t border-stone-200 py-5">
              <span>Total estimado</span>
              <strong className="text-2xl">{money(total())}</strong>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              El precio y el stock se confirman al realizar el pedido.
            </p>
            <Link to="/checkout" className="btn w-full">
              Continuar →
            </Link>
          </Card>
        </div>
      )}
    </>
  );
}
