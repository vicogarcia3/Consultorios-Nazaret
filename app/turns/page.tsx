import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TurnsPage() {
  const turns = await prisma.turn.findMany({
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <main style={{ padding: 20 }}>
      <h1>📅 Turnos</h1>

      <Link href="/turns/new">
        <button>+ Nuevo turno</button>
      </Link>

      <hr />

      {turns.length === 0 ? (
        <p>No hay turnos</p>
      ) : (
        <ul>
          {turns.map((t) => (
            <li key={t.id}>
              {new Date(t.date).toLocaleString("es-AR")} -{" "}
              {t.patient.name} con {t.doctor.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}