import { prisma } from "@/lib/prisma";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const budget = await prisma.budget.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      patient: true,
    },
  });

  if (!budget) {
    return <p>Presupuesto no encontrado</p>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>📄 Presupuesto #{budget.id}</h1>

      <p>
        <strong>Paciente:</strong>{" "}
        {budget.patient.name}
      </p>

      <p>
        <strong>Fecha:</strong>{" "}
        {new Date(
          budget.createdAt
        ).toLocaleDateString("es-AR")}
      </p>

      <hr />

      <h3>Tratamientos</h3>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
        }}
      >
        {budget.treatments}
      </pre>

      <hr />

      <h2>
        Total: $
        {budget.total.toLocaleString(
          "es-AR"
        )}
      </h2>
    </main>
  );
}