"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [plans, setPlans] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    dni: "",
    phone: "",
    planId: "",
    joinDate: "",
    nextCleaning: "",
    notes: "",
    paymentStatus: "al_dia",
  });

  useEffect(() => {
    async function loadData() {
      const patient = await fetch(
        `/api/patients/${id}`
      ).then((r) => r.json());

      const plansData = await fetch(
        "/api/plans"
      ).then((r) => r.json());

      setPlans(plansData);

      setForm({
        name: patient.name || "",
        dni: patient.dni || "",
        phone: patient.phone || "",
        planId: patient.planId?.toString() || "",
        joinDate: patient.joinDate
          ? patient.joinDate.substring(0, 10)
          : "",
        nextCleaning: patient.nextCleaning
          ? patient.nextCleaning.substring(0, 10)
          : "",
        paymentStatus:
          patient.paymentStatus || "al_dia",
        notes: patient.notes || "",
      });
    }

    loadData();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
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

    const res = await fetch(
      `/api/patients/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push(
        `/patients/${id}`
      );
    } else {
      alert(
        "Error al actualizar paciente"
      );
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Editar paciente</h1>

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
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="date"
          name="joinDate"
          value={form.joinDate}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="date"
          name="nextCleaning"
          value={form.nextCleaning}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={handleChange}
        />

        <br />
        <br />

        <select
          name="planId"
          value={form.planId}
          onChange={handleChange}
        >
          <option value="">
            Sin plan
          </option>

          {plans.map((plan) => (
            <option
              key={plan.id}
              value={plan.id}
            >
              {plan.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <select
          name="paymentStatus"
          value={form.paymentStatus}
          onChange={handleChange}
        >
          <option value="al_dia">
            Al día
          </option>

          <option value="adeuda">
            Adeuda
          </option>
        </select>

        <br />
        <br />

        <textarea
          name="notes"
          placeholder="Observaciones"
          value={form.notes}
          onChange={handleChange}
        />

        <br />
        <br />

        <button>
          Guardar cambios
        </button>
      </form>
    </main>
  );
}