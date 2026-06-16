"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const params = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      `/api/users/${params.id}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      }
    );

    if (res.ok) {
      alert(
        "Contraseña actualizada"
      );
      router.push("/users");
    } else {
      alert("Error");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>🔒 Cambiar contraseña</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br />
        <br />

        <button>
          Guardar
        </button>
      </form>
    </main>
  );
}