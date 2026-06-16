import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main>
      {/* HERO */}
      <section
        style={{
          background: "#A2B38B",
          color: "white",
          padding: "80px 40px",
          borderRadius: "0 0 30px 30px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "3rem", marginBottom: 20 }}>
              CONSULTORIOS NAZARET
            </h1>

            <h2 style={{ fontWeight: 400, marginBottom: 30 }}>
              Tu sonrisa es nuestra prioridad
            </h2>

            <p style={{ maxWidth: 500, lineHeight: 1.6 }}>
              Atención odontológica integral para toda la familia.
              Profesionales especializados, tecnología moderna y
              tratamientos personalizados.
            </p>

            <div
              style={{
                marginTop: 30,
                display: "flex",
                gap: 15,
              }}
            >
              <Link href="/login">
                <button
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  Iniciar sesión
                </button>
              </Link>

              <button
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Solicitar turno
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <img
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200"
              alt="Consultorio odontológico"
              style={{
                width: "100%",
                borderRadius: 20,
              }}
            />
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section
        style={{
          maxWidth: 1200,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <h2>¿Quiénes somos?</h2>

        <p style={{ lineHeight: 1.8, fontSize: "1.1rem" }}>
          En Consultorios Nazaret brindamos atención odontológica integral,
          enfocándonos en la prevención, diagnóstico y tratamiento de
          patologías bucodentales. Nuestro compromiso es ofrecer una
          atención cercana, profesional y personalizada para cada paciente.
        </p>
      </section>

      {/* ESPECIALISTAS */}
      <section
        style={{
          background: "#fff",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <h2>Nuestros especialistas</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
              marginTop: 30,
            }}
          >
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                style={{
                  background: "#F6F4EE",
                  padding: 20,
                  borderRadius: 15,
                  textAlign: "center",
                }}
              >
                <img
                  src={doctor.photo || "/doctor-default.png"}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 10,
                  }}
                />

                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section
        style={{
          maxWidth: 1200,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <h2>Planes disponibles</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginTop: 30,
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              padding: 20,
              borderRadius: 15,
            }}
          >
            <h3>Plan Básico</h3>
            <p>Consultas y controles periódicos.</p>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              padding: 20,
              borderRadius: 15,
            }}
          >
            <h3>Plan Familiar</h3>
            <p>Cobertura para todo el grupo familiar.</p>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section
        style={{
          background: "#A2B38B",
          color: "white",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <h2>Contacto</h2>

          <p>📍 Córdoba, Argentina</p>
          <p>📞 +54 351 704-9724</p>
          <p>📱 Instagram: @consultorio_nazaret</p>
        </div>
      </section>
    </main>
  );
}