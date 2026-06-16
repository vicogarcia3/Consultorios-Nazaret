"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewRecordPage() {
  const router = useRouter();
  const params = useParams();

  const patientId = params.id as string;

  const [form, setForm] = useState({
    title: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
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
      "/api/medical-records",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          ...form,
        }),
      }
    );

    if (res.ok) {
      router.push(
        `/patients/${patientId}`
      );
    } else {
      const error = await res.text();
      alert(error);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Nueva consulta</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Motivo de consulta"
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <textarea
          name="diagnosis"
          placeholder="Diagnóstico"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="treatment"
          placeholder="Tratamiento"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="notes"
          placeholder="Observaciones"
          onChange={handleChange}
        />

        <br />
        <br />

        <button type="submit">
          Guardar consulta
        </button>
      </form>
    </main>
  );
}