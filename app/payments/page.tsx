import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const payments =
    await prisma.payment.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

  return (
    <main style={{ padding: 20 }}>
      <h1>💳 Pagos</h1>

      <Link href="/payments/new">
        <button>
          + Nuevo pago
        </button>
      </Link>

      <hr />

      {payments.length === 0 ? (
        <p>
          No hay pagos registrados.
        </p>
      ) : (
        <PaymentsClient
          payments={payments}
        />
      )}
    </main>
  );
}