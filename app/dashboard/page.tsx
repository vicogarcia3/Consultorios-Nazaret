import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const totalPatients =
    await prisma.patient.count();

  const totalDoctors =
    await prisma.doctor.count();

  const totalPlans =
    await prisma.plan.count();

  return (
    <main style={{ padding: 20 }}>
      <h1>📊 Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        >
          <h2>👥 Pacientes</h2>
          <p
            style={{
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            {totalPatients}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        >
          <h2>👨‍⚕️ Especialistas</h2>
          <p
            style={{
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            {totalDoctors}
          </p>
        </div>

        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        >
          <h2>📋 Planes</h2>
          <p
            style={{
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            {totalPlans}
          </p>
        </div>
      </div>
    </main>
  );
}