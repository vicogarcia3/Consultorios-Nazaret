"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditTurnClient({ id }: { id: string }) {
  const router = useRouter();

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    status: "",
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const turn = await fetch(`/api/turns/${id}`).then((r) =>
        r.json()
      );

      const patients = await fetch("/api/patients").then((r) =>
        r.json()
      );

      const doctors = await fetch("/api/doctors").then((r) =>
        r.json()
      );

      setPatients(patients);
      setDoctors(doctors);

      setForm({
        patientId: String(turn.patientId),
        doctorId: String(turn.doctorId),
        date: turn.date.slice(0, 16),
        status: turn.status,
      });
    }

    if (id) loadData();
  }, [id]);

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch(`/api/turns/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        date: form.date,
        status: form.status,
      }),
    });

    if (res.ok) {
      router.push("/calendar");
    } else {
      alert("Error al actualizar turno");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Editar turno</h1>

      <form onSubmit={handleSubmit}>
        <select
          name="patientId"
          value={form.patientId}
          onChange={handleChange}
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <select
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
        />

        <br />
        <br />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="pending">Pendiente</option>
          <option value="completed">Realizado</option>
        </select>

        <br />
        <br />

        <button>Guardar cambios</button>
      </form>
    </main>
  );
}