import { prisma } from "@/lib/prisma";
import DoctorAvatar from "@/components/DoctorAvatar";

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "50px auto",
        padding: 20,
      }}
    >
      <h1>Nuestros Especialistas</h1>

      <p>
        Conocé al equipo profesional de Consultorios Nazaret.
        Trabajamos para brindarte una atención cercana,
        personalizada y de excelencia.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            style={{
              background: "#fff",
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <DoctorAvatar
              name={doctor.name}
              photo={doctor.photo}
            />

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>
                {doctor.name}
              </h3>

              <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
                {doctor.specialty}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}