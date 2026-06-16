"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    dni: "",
    phone: "",
    planId: "",
    joinDate: "",
    nextCleaning: "",
    paymentStatus: "al_dia",
    notes: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/patients");
    } else {
      alert("Error al crear paciente");
    }
  }

  return (
    <div>
      <h1>Nuevo paciente</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" onChange={handleChange} />
        <input name="dni" placeholder="DNI" onChange={handleChange} />
        <input name="phone" placeholder="Teléfono" onChange={handleChange} />

        {/* 🔥 SELECT DE PLANES */}
        <select name="planId" onChange={handleChange}>
          <option value="">Seleccionar plan</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input type="date" name="joinDate" onChange={handleChange} />
        <input type="date" name="nextCleaning" onChange={handleChange} />

        <input name="paymentStatus" placeholder="Estado pago" onChange={handleChange} />

        <textarea name="notes" placeholder="Notas" onChange={handleChange} />

        <button>Crear paciente</button>
      </form>
    </div>
  );
}