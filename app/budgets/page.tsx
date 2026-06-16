import Link from "next/link";

async function getBudgets() {
  const res = await fetch(
    "http://localhost:3000/api/budgets",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function BudgetsPage() {
  const budgets = await getBudgets();

  return (
    <main style={{ padding: 20 }}>
      <h1>📄 Presupuestos</h1>

      <Link href="/budgets/new">
        <button>
          ➕ Nuevo presupuesto
        </button>
      </Link>

      <hr />

      {budgets.length === 0 ? (
        <p>No hay presupuestos cargados.</p>
      ) : (
        budgets.map((budget: any) => (
          <div
            key={budget.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
            }}
          >
            <h3>
              <Link
                href={`/budgets/${budget.id}`}
              >
                {budget.patient.name}
              </Link>
            </h3>

            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(
                budget.createdAt
              ).toLocaleDateString(
                "es-AR"
              )}
            </p>

            <pre
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              {budget.treatments}
            </pre>

            <strong>
              Total: $
              {budget.total.toLocaleString(
                "es-AR"
              )}
            </strong>

            <br />
            <br />

            <a
              href={`/api/budgets/${budget.id}/pdf`}
              target="_blank"
            >
              <button>
                Ver PDF
              </button>
            </a>
          </div>
        ))
      )}
    </main>
  );
}