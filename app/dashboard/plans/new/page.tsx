"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPlanPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    benefits: "",
  });

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        description: form.description,
        benefits: form.benefits,
      }),
    });

    if (res.ok) {
      router.push("/plans");
    } else {
      alert("Error al crear plan");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Nuevo plan</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        
        <input
          name="name"
          placeholder="Nombre del plan"
          onChange={handleChange}
        />

        <input
          name="price"
          placeholder="Precio"
          type="number"
          onChange={handleChange}
        />

        {/* 🆕 DESCRIPCIÓN */}
        <textarea
          name="description"
          placeholder="Descripción del plan"
          onChange={handleChange}
        />

        {/* 🆕 BENEFICIOS */}
        <textarea
          name="benefits"
          placeholder="Beneficios (ej: consultas gratis, descuentos, urgencias...)"
          onChange={handleChange}
        />

        <button type="submit">
          Crear
        </button>
      </form>
    </main>
  );
}