"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    const confirm = window.confirm("¿Seguro que querés eliminar este paciente?");
    if (!confirm) return;

    const res = await fetch(`/api/patients/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/patients");
    } else {
      alert("Error al eliminar");
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{ background: "red", color: "white", marginLeft: 10 }}
    >
      Eliminar
    </button>
  );
}