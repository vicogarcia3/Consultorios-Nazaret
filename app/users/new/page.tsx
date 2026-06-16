"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "professional",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/users");
    } else {
      alert("Error al crear usuario");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>➕ Nuevo Usuario</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />

        <br />
        <br />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="professional">
            Profesional
          </option>

          <option value="admin">
            Administrador
          </option>
        </select>

        <br />
        <br />

        <button>
          Crear usuario
        </button>
      </form>
    </main>
  );
}