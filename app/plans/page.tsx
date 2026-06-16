import { prisma } from "@/lib/prisma";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: {
      price: "asc",
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
      <h1>📋 Nuestros Planes</h1>

      <p>
        Conocé nuestros planes y elegí el que mejor se adapte a vos y tu familia.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "white",
              padding: 25,
              borderRadius: 15,
              border: "1px solid #ddd",
              boxShadow:
                "0 2px 8px rgba(0,0,0,.05)",
            }}
          >
            <h2>{plan.name}</h2>

            <p
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#A2B38B",
              }}
            >
              ${plan.price}
            </p>

            {plan.description && (
              <p>{plan.description}</p>
            )}

            {plan.benefits && (
              <div style={{ marginTop: 15 }}>
                <strong>Beneficios:</strong>

                <ul>
                  {plan.benefits
                    .split(",")
                    .map((benefit, index) => (
                      <li key={index}>
                        {benefit.trim()}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <button
              style={{
                marginTop: 20,
                background: "#A2B38B",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Quiero afiliarme
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}