
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { signIn } from "next-auth/react";
import { LockKeyhole, Eye, EyeOff, UserRound } from "lucide-react";
import Link from "next/link";

export default function IniciarSesionPage() {
  const [checking, setChecking] = useState(true);
  const [registrationAvailable, setRegistrationAvailable] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/auth/admin-setup", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Error al verificar la cuenta.");
        }

        const data = await response.json();

        setRegistrationAvailable(
          data.registrationAvailable === true
        );
      } catch {
        setError(
          "No se pudo verificar el acceso administrativo."
        );
      } finally {
        setChecking(false);
      }
    }

    void checkAdmin();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (registrationAvailable) {
        const response = await fetch("/api/auth/admin-setup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ?? "No se pudo crear la cuenta."
          );

          if (response.status === 409) {
            setRegistrationAvailable(false);
          }

          return;
        }

        setRegistrationAvailable(false);
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Correo electrónico o contraseña incorrectos."
        );
        return;
      }

      window.location.assign("/acceso");
    } catch {
      setError(
        "Ocurrió un error. Intentá nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="login-page">
        <div className="login-card">
          <p>Verificando acceso administrativo...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          {registrationAvailable ? (
            <UserRound size={28} />
          ) : (
            <LockKeyhole size={28} />
          )}
        </div>

        <h1>
          {registrationAvailable
            ? "Crear cuenta administradora"
            : "Administración"}
        </h1>

        <p>
          {registrationAvailable
            ? "Creá la cuenta principal de Consultorios Nazaret."
            : "Ingresá con tu cuenta de Consultorios Nazaret."}
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
            autoComplete="email"
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
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder={
                registrationAvailable
                  ? "Creá una contraseña segura"
                  : "Ingresá tu contraseña"
              }
              autoComplete={
                registrationAvailable
                  ? "new-password"
                  : "current-password"
              }
              required
            />

            <button
              type="button"
              className="login-password-toggle"
              onClick={() =>
                setShowPassword(!showPassword)
              }
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

        {!registrationAvailable && (
          <Link
            href="/olvide-contrasena"
            className="forgot-password-link"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}

        {error && (
          <p className="settings-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || Boolean(error && checking)}
        >
          {loading
            ? registrationAvailable
              ? "Creando cuenta..."
              : "Ingresando..."
            : registrationAvailable
              ? "Crear cuenta"
              : "Iniciar sesión"}
        </button>
      </form>
    </main>
  );
}
