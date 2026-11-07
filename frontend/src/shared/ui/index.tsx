import { useEffect, useId, useRef } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import type { EstadoPedido } from "../../features/pedidos/types";
import { etiquetaEstado } from "../../features/pedidos/types";
export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
export function Button({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`badge badge-${estado}`}>{etiquetaEstado(estado)}</span>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 id={titleId} className="text-2xl font-bold">
          {title}
        </h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function FieldError({ errors }: { errors: readonly unknown[] }) {
  return errors.length ? (
    <p className="field-error" role="alert">
      {errors.map(String).join(". ")}
    </p>
  ) : null;
}
