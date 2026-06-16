import { prisma } from "@/lib/prisma";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const turns =
    await prisma.turn.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        date: "asc",
      },
    });

  return (
    <main
      style={{
        padding: 30,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>📅 Agenda de Turnos</h1>

      {turns.length === 0 ? (
        <p>
          No hay turnos registrados.
        </p>
      ) : (
        <CalendarClient
          turns={turns}
        />
      )}
    </main>
  );
}