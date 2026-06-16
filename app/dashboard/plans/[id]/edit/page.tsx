"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPlanPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      const res = await fetch(`/api/plans/${params.id}`);
      const data = await res.json();

      setForm({
        name: data.name,
        price: data.price,
      });

      setLoading(false);
    }

    loadPlan();
  }, [params.id]);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch(`/api/plans/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
      }),
    });

    if (res.ok) {
      router.push("/plans");
    } else {
      alert("Error al actualizar plan");
    }
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Editar plan</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />

        <button>Guardar</button>
      </form>
    </main>
  );
}