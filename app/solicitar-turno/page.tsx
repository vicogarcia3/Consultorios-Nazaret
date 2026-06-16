"use client";

import { useEffect, useState } from "react";

export default function SolicitarTurnoPage() {
  const [doctors, setDoctors] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    dni: "",
    phone: "",
    doctorId: "",
    date: "",
  });

  useEffect(() => {
    async function loadDoctors() {
      const res = await fetch("/api/doctors");
      const data = await res.json();

      setDoctors(data);
    }

    loadDoctors();
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

    const res = await fetch(
      "/api/public-turns",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      alert(
        "Turno solicitado correctamente"
      );

      setForm({
        name: "",
        dni: "",
        phone: "",
        doctorId: "",
        date: "",
      });
    } else {
      const error = await res.json();

      alert(
        error.error ||
          "Error al solicitar turno"
      );
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
      <h1>Solicitar turno</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nombre completo"
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
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={handleChange}
        />

        <br />
        <br />

        <select
          name="doctorId"
          value={form.doctorId}
          onChange={handleChange}
        >
          <option value="">
            Seleccione especialista
          </option>

          {doctors.map((doctor) => (
            <option
              key={doctor.id}
              value={doctor.id}
            >
              {doctor.name} - {doctor.specialty}
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

        <button type="submit">
          Solicitar turno
        </button>
      </form>
    </main>
  );
}