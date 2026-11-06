import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthStore } from "../../../store/authStore";
import { Button, FieldError } from "../../../shared/ui";
import { handleApiError } from "../../../shared/api/handleApiError";
export function AuthPage({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({
    defaultValues: { username: "", password: "", full_name: "", email: "" },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        if (register) await authApi.register(value);
        await login(value.username, value.password);
        const from: unknown = location.state;
        const next =
          typeof from === "object" &&
          from &&
          "from" in from &&
          typeof from.from === "string"
            ? from.from
            : "/";
        navigate(next, { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow text-amber-200">SENTITE COMO EN CASA</p>
        <h1>
          Tu próxima
          <br />
          comida favorita
          <br />
          <em>te espera.</em>
        </h1>
        <p>
          Elegí algo rico, armá tu pedido y dejá el resto en nuestras manos.
        </p>
        <div className="auth-stamp">
          Hecho con
          <br />
          <strong>mucho amor</strong>
        </div>
      </div>
      <section className="card p-7 md:p-10">
        <p className="eyebrow">FOOD STORE</p>
        <h2 className="text-3xl font-bold mt-3">
          {register ? "Creá tu cuenta" : "Qué bueno verte"}
        </h2>
        <p className="mt-2 mb-7 text-stone-500">
          {register
            ? "Un paso más cerca de tu próxima comida."
            : "Ingresá para seguir disfrutando."}
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {(register
            ? (["full_name", "username", "email", "password"] as const)
            : (["username", "password"] as const)
          ).map((name) => (
            <form.Field
              key={name}
              name={name}
              validators={{
                onChange: ({ value }) =>
                  !value.trim()
                    ? "Este campo es obligatorio"
                    : name === "password" && value.length < 8
                      ? "Usá al menos 8 caracteres"
                      : name === "email" &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? "Ingresá un email válido"
                        : undefined,
              }}
            >
              {(field) => (
                <label className="field">
                  {
                    {
                      username: "Usuario",
                      password: "Contraseña",
                      full_name: "Nombre completo",
                      email: "Email",
                    }[name]
                  }
                  <input
                    className="input"
                    name={field.name}
                    type={
                      name === "password"
                        ? "password"
                        : name === "email"
                          ? "email"
                          : "text"
                    }
                    autoComplete={
                      name === "password"
                        ? register
                          ? "new-password"
                          : "current-password"
                        : name === "full_name"
                          ? "name"
                          : name
                    }
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                    minLength={name === "password" ? 8 : undefined}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </label>
              )}
            </form.Field>
          ))}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting
                  ? "Un momento…"
                  : register
                    ? "Crear cuenta"
                    : "Ingresar →"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-sm text-stone-500">
          {register ? "¿Ya tenés una cuenta?" : "¿Es tu primera visita?"}{" "}
          <Link className="text-link" to={register ? "/login" : "/register"}>
            {register ? "Ingresá" : "Registrate"}
          </Link>
        </p>
      </section>
    </div>
  );
}
