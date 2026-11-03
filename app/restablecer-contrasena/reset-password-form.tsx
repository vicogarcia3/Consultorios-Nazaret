
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const validToken = /^[a-f0-9]{64}$/.test(token);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!validToken) {
      setError("El enlace no es válido.");
      return;
    }

    if (
      password.length < 8 ||
      password.length > 128
    ) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const responseText = await response.text();

      let data: {
        success?: boolean;
        error?: string;
      } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Respuesta inválida del servidor. Código: ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ??
            `No se pudo cambiar la contraseña. Código: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          "El servidor no confirmó el cambio."
        );
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);

      // Sacar el token de la URL luego de utilizarlo.
      window.history.replaceState(
        null,
        "",
        "/restablecer-contrasena"
      );
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
            <CheckCircle2 size={28} />
          </div>

          <h1>¡Contraseña actualizada!</h1>

          <p>
            Tu contraseña se cambió correctamente.
            Ya podés ingresar a Consultorios Nazaret
            utilizando tu nueva contraseña.
          </p>

          <Link
            href="/iniciar-sesion"
            className="btn btn-primary"
          >
            Iniciar sesión
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

        <h1>Crear nueva contraseña</h1>

        <p>
          Ingresá una nueva contraseña para
          recuperar el acceso a tu cuenta.
        </p>

        {!validToken ? (
          <>
            <p className="settings-error" role="alert">
              El enlace no es válido. Solicitá
              uno nuevo para continuar.
            </p>

            <Link
              href="/olvide-contrasena"
              className="btn btn-primary"
            >
              Solicitar nuevo enlace
            </Link>
          </>
        ) : (
          <>
            <div className="settings-field">
              <label htmlFor="new-password">
                Nueva contraseña
              </label>

              <div className="login-password-wrapper">
                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
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
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <small>
                La contraseña debe tener 8 caracteres
                o más.
              </small>
            </div>

            <div className="settings-field">
              <label htmlFor="confirm-new-password">
                Confirmar contraseña
              </label>

              <div className="login-password-wrapper">
                <input
                  id="confirm-new-password"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                  aria-label={
                    showConfirm
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
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
                ? "Guardando contraseña..."
                : "Guardar nueva contraseña"}
            </button>

            <Link
              href="/iniciar-sesion"
              className="forgot-password-back"
            >
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </form>
    </main>
  );
}
