"use client";

import { useRouter } from "next/navigation";

export default function DeleteDoctorButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = window.confirm("¿Seguro que querés eliminar este especialista?");
    if (!ok) return;

    const res = await fetch(`/api/doctors/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error al eliminar");
    }
  }

  return (
    <button onClick={handleDelete} style={{ color: "red" }}>
      Eliminar
    </button>
  );
}