"use client";

import { useState } from "react";
import DeleteDoctorButton from "@/components/DeleteDoctorButton";
import DoctorAvatar from "@/components/DoctorAvatar";

export default function DoctorsClient({
  doctors,
  isAdmin = false,
}: {
  doctors: any[];
  isAdmin?: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    photo: "",
  });

  function startEdit(doctor: any) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      photo: doctor.photo || "",
    });
  }

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleUpdate(id: number) {
    const res = await fetch(`/api/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setEditingId(null);
      window.location.reload();
    } else {
      alert("Error al editar");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {doctors.map((doctor: any) => (
        <div
          key={doctor.id}
          style={{
            background: "#fff",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <DoctorAvatar
            name={doctor.name}
            photo={doctor.photo}
          />

          {editingId === doctor.id ? (
            <div style={{ flex: 1 }}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
              />
              <input
                name="photo"
                value={form.photo}
                onChange={handleChange}
              />

              <div style={{ marginTop: 10 }}>
                <button onClick={() => handleUpdate(doctor.id)}>
                  Guardar
                </button>

                <button onClick={() => setEditingId(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{doctor.name}</h3>
                <p style={{ margin: 0 }}>{doctor.specialty}</p>
              </div>

              {/* SOLO ADMIN PUEDE EDITAR */}
              {isAdmin && (
                <>
                  <button onClick={() => startEdit(doctor)}>
                    Editar
                  </button>

                  <DeleteDoctorButton id={doctor.id} />
                </>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}