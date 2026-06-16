"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPaymentPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);

  const [form, setForm] = useState({
    patientId: "",
    amount: "",
    month: "",
    dueDate: "",
  });

  useEffect(() => {
    async function loadPatients() {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    }

    loadPatients();
  }, []);

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: Number(form.patientId),
        amount: Number(form.amount),
        month: form.month,
        dueDate: form.dueDate,
      }),
    });

    if (res.ok) {
      router.push("/payments");
    } else {
      alert("Error al crear pago");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Nuevo pago</h1>

      <form onSubmit={handleSubmit}>
        <select
          name="patientId"
          value={form.patientId}
          onChange={handleChange}
        >
          <option value="">Paciente</option>

          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          type="number"
          name="amount"
          placeholder="Importe"
          value={form.amount}
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="month"
          placeholder="Mes (Ej: Junio 2026)"
          value={form.month}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">
          Crear pago
        </button>
      </form>
    </main>
  );
}