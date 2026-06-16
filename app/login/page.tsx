"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await signIn(
      "credentials",
      {
        email,
        password,
        callbackUrl: "/",
      }
    );
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: "50px auto",
      }}
    >
      <h1>Iniciar sesión</h1>

      <form
        onSubmit={handleSubmit}
      >
        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <button>
          Ingresar
        </button>
      </form>
    </main>
  );
}