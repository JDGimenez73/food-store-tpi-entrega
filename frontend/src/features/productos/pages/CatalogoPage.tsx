import { useState } from "react";
import { useProductos } from "../hooks/useProductos";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { Button } from "../../../shared/ui";
import {
  EstadoError,
  EstadoVacio,
  Paginacion,
  Skeleton,
} from "../../../shared/components/States";
export function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<number>();
  const [page, setPage] = useState(0);
  const productos = useProductos({
    skip: page * 12,
    limit: 12,
    search,
    categoria_id: categoria,
  });
  const categorias = useCategorias();
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">FRESCO · SIMPLE · DELICIOSO</p>
          <h1>
            Hoy se come
            <br />
            <em>bien.</em>
          </h1>
          <p>
            Comida que te hace bien.
            <br />
            Elegí tus favoritos y disfrutá el momento.
          </p>
          <a className="btn mt-6" href="#menu">
            Explorá el menú ↓
          </a>
        </div>
        <div className="hero-plate" aria-hidden="true">
          <div className="plate-ring">
            <div className="plate-food">
              <span>🥗</span>
            </div>
          </div>
          <span className="hero-label">
            Preparado
            <br />
            <strong>para vos.</strong>
          </span>
          <span className="hero-small">
            BUENOS INGREDIENTES
            <br />
            MEJORES MOMENTOS
          </span>
        </div>
      </section>
      <section id="menu" className="mt-12">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ENCONTRÁ TU FAVORITO</p>
            <h2 className="text-3xl font-bold">Nuestro menú</h2>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Buscar productos"
              placeholder="¿Qué te gustaría comer?"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </label>
        </div>
        {categorias.isError && (
          <EstadoError
            error={categorias.error}
            retry={() => void categorias.refetch()}
          />
        )}
        <div className="category-filters">
          <button
            className={categoria === undefined ? "active" : ""}
            onClick={() => {
              setCategoria(undefined);
              setPage(0);
            }}
          >
            Todo el menú
          </button>
          {categorias.data?.map((item) => (
            <button
              key={item.id}
              className={categoria === item.id ? "active" : ""}
              onClick={() => {
                setCategoria(item.id);
                setPage(0);
              }}
            >
              {item.nombre}
            </button>
          ))}
        </div>
        {productos.isPending ? (
          <Skeleton />
        ) : productos.isError ? (
          <EstadoError
            error={productos.error}
            retry={() => void productos.refetch()}
          />
        ) : !productos.data.items.length ? (
          <>
            <EstadoVacio
              title="No encontramos ese antojo"
              description={
                page > 0
                  ? "El menú cambió. Volvé a la primera página para ver las opciones disponibles."
                  : "Probá con otra búsqueda o categoría."
              }
            />
            {page > 0 && (
              <Button className="btn-secondary mt-5" onClick={() => setPage(0)}>
                Volver a la primera página
              </Button>
            )}
          </>
        ) : (
          <>
            <div
              className={`product-grid ${productos.isFetching ? "opacity-60" : ""}`}
            >
              {productos.data.items.map((item) => (
                <ProductoCard key={item.id} producto={item} />
              ))}
            </div>
            <Paginacion
              page={page}
              size={12}
              total={productos.data.total}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </>
  );
}
