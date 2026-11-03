
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, MailCheck } from "lucide-react";

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "No se pudo procesar la solicitud."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error. Intentá nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-icon">
            <MailCheck size={28} />
          </div>

          <h1>Revisá tu correo</h1>

          <p>
            Si existe una cuenta habilitada con ese
            correo electrónico, recibirás un enlace
            para restablecer tu contraseña.
          </p>

          <p>
            El enlace tendrá una validez de 30 minutos.
            Revisá también la carpeta de spam.
          </p>

          <Link
            href="/iniciar-sesion"
            className="btn btn-primary"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <div className="login-icon">
          <KeyRound size={28} />
        </div>

        <h1>Recuperar contraseña</h1>

        <p>
          Ingresá el correo electrónico asociado
          a tu cuenta de Consultorios Nazaret.
          Te enviaremos un enlace para crear
          una nueva contraseña.
        </p>

        <div className="settings-field">
          <label htmlFor="reset-email">
            Correo electrónico
          </label>

          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Ingresá tu correo electrónico"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>

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
          {loading
            ? "Enviando..."
            : "Enviar enlace de recuperación"}
        </button>

        <Link
          href="/iniciar-sesion"
          className="forgot-password-back"
        >
          <ArrowLeft size={16} />
          Volver a iniciar sesión
        </Link>
      </form>
    </main>
  );
}
