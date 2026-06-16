"use client";

import Link from "next/link";

export default function PlansClient({ plans }: any) {
  return (
    <main style={{ padding: 20 }}>
      <h1>📋 Planes</h1>

      <Link href="/dashboard/plans/new">
        <button>+ Crear plan</button>
      </Link>

      <hr />

      {plans.length === 0 ? (
        <p>No hay planes</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              style={{
                background: "white",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              {/* TITULO + PRECIO */}
              <h2>{plan.name}</h2>
              <p style={{ fontSize: 18 }}>
                💰 ${plan.price}
              </p>

              {/* DESCRIPCIÓN */}
              {plan.description && (
                <p style={{ marginTop: 8 }}>
                  {plan.description}
                </p>
              )}

              {/* BENEFICIOS */}
              {plan.benefits && (
                <div style={{ marginTop: 10 }}>
                  <strong>⭐ Beneficios:</strong>
                  <ul>
                    {plan.benefits
                      .split(",")
                      .map((b: string, i: number) => (
                        <li key={i}>{b.trim()}</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* ACCIONES */}
              <div style={{ marginTop: 12 }}>
                <Link href={`/dashboard/plans/${plan.id}/edit`}>
                  Editar
                </Link>

                <button
                  style={{
                    marginLeft: 10,
                    color: "red",
                  }}
                  onClick={async () => {
                    await fetch(`/api/plans/${plan.id}`, {
                      method: "DELETE",
                    });

                    location.reload();
                  }}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}