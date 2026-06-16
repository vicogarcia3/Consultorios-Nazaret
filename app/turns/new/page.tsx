"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTurnPage() {
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
  });

  useEffect(() => {
    async function loadData() {
      const p = await fetch("/api/patients").then((r) => r.json());
      const d = await fetch("/api/doctors").then((r) => r.json());

      setPatients(p);
      setDoctors(d);
    }

    loadData();
  }, []);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/turns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/turns");
    } else {
      alert("Error al crear turno");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Nuevo turno</h1>

      <form onSubmit={handleSubmit}>
        <select name="patientId" onChange={handleChange}>
          <option value="">Paciente</option>
          {patients.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select name="doctorId" onChange={handleChange}>
          <option value="">Doctor</option>
          {doctors.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input type="datetime-local" name="date" onChange={handleChange} />

        <button>Crear turno</button>
      </form>
    </main>
  );
}