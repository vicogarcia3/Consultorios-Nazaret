"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDoctorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    photo: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function uploadImage() {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url; // IMPORTANTE: usa "url"
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    let photoUrl = "";

    if (file) {
      photoUrl = await uploadImage();
    }

    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard/doctors");
    } else {
      alert("Error al crear doctor");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Nuevo especialista</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nombre"
          onChange={handleChange}
        />

        <br />

        <input
          name="specialty"
          placeholder="Especialidad"
          onChange={handleChange}
        />

        <br />

        {/* 📸 ARCHIVO */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("file", file);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              const data = await res.json();

              console.log("UPLOAD RESPONSE:", data);

              setForm((prev) => ({
                ...prev,
                photo: data.fileUrl,
              }));
          }}
        />

        <br /><br />

        <button disabled={loading}>
          {loading ? "Creando..." : "Crear doctor"}
        </button>
      </form>
    </main>
  );
}