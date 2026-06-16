"use client";

import { useEffect, useState } from "react";

export default function AfiliarsePage() {
  const [plans, setPlans] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    dni: "",
    phone: "",
    planId: "",
  });

  useEffect(() => {
    async function loadPlans() {
      const res = await fetch("/api/plans");
      const data = await res.json();

      setPlans(data);
    }

    loadPlans();
  }, []);

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

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        dni: form.dni,
        phone: form.phone,
        planId: Number(form.planId),
      }),
    });

    if (res.ok) {
      alert(
        "Solicitud enviada correctamente"
      );

      setForm({
        name: "",
        dni: "",
        phone: "",
        planId: "",
      });
    } else {
      alert("Error");
    }
  }

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>Afiliarme a Nazaret</h1>

      <p>
        Completá tus datos y nos
        comunicaremos con vos.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 10,
          }}
        />

        <input
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 10,
          }}
        />

        <input
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 10,
          }}
        />

        <select
          name="planId"
          value={form.planId}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: 20,
            padding: 10,
          }}
        >
          <option value="">
            Seleccione un plan
          </option>

          {plans.map((plan) => (
            <option
              key={plan.id}
              value={plan.id}
            >
              {plan.name} - $
              {plan.price}
            </option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
          }}
        >
          Solicitar afiliación
        </button>
      </form>
    </main>
  );
}