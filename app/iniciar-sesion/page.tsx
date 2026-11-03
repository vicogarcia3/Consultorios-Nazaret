
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function IniciarSesionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      
    if (result?.error) {
      if (result.code === "professional_disabled") {
        setError("No estás habilitado como profesional para ingresar.");
      } else {
        setError("Correo electrónico o contraseña incorrectos.");
      }

      return;
    }

      window.location.assign("/acceso");
    } catch {
      setError("No se pudo iniciar sesión. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <div className="login-icon">
          <LockKeyhole size={28} />
        </div>

        <h1>Administración</h1>

        <p>
          Ingresá con tu cuenta de Consultorios Nazaret.
        </p>

        <div className="settings-field">
          <label htmlFor="login-email">
            Correo electrónico
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ingresá tu correo electrónico"
            autoComplete="username"
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="login-password">
            Contraseña
          </label>

          <div className="login-password-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresá tu contraseña"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        <Link
          href="/olvide-contrasena"
          className="forgot-password-link"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </main>
  );
}
