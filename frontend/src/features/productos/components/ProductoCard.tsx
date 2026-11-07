import { useState } from "react";
import type { Producto } from "../types";
import { useCartStore } from "../../../store/cartStore";
import { money, Button } from "../../../shared/ui";
export function ProductoCard({ producto }: { producto: Producto }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const agregar = useCartStore((s) => s.agregar);
  const cantidad = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad || 0,
  );
  const available = producto.disponible && producto.stock > cantidad;
  return (
    <article className="product-card card">
      <div className="product-image">
        {producto.imagen_url && !imageFailed ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="food-placeholder" aria-hidden="true">
            🍽<span>HECHO PARA DISFRUTAR</span>
          </div>
        )}
        <span className="product-category">{producto.categoria.nombre}</span>
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold">{producto.nombre}</h2>
        <p className="product-description">
          {producto.descripcion || "Una buena elección para tu día."}
        </p>
        <div className="flex items-center justify-between gap-3 mt-5">
          <strong className="text-xl">{money(producto.precio_base)}</strong>
          <Button
            className="btn-small"
            disabled={!available}
            onClick={() => {
              agregar(producto);
              setAdded(true);
            }}
          >
            {!producto.disponible || producto.stock < 1
              ? "No disponible"
              : !available
                ? "Máximo agregado"
                : added
                  ? "Agregar otro +"
                  : "Agregar +"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-stone-400" aria-live="polite">
          {cantidad
            ? `${cantidad} en tu carrito`
            : `${producto.stock} disponibles`}
        </p>
      </div>
    </article>
  );
}
