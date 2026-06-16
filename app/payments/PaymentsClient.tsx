"use client";

export default function PaymentsClient({
  payments,
}: any) {
  async function markAsPaid(id: number) {
    const res = await fetch(
      `/api/payments/${id}`,
      {
        method: "PATCH",
      }
    );

    if (res.ok) {
      location.reload();
    } else {
      alert("Error al actualizar");
    }
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Mes</th>
          <th>Importe</th>
          <th>Vencimiento</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        {payments.map((payment: any) => (
          <tr 
            key={payment.id}
            style={{
                background:
                payment.status !== "paid" &&
                new Date(payment.dueDate) < new Date()
                  ? "ffe5e5"
                  : "transparent",
            }}
        >
            <td>{payment.patient.name}</td>

            <td>{payment.month}</td>

            <td>${payment.amount}</td>

            <td>
              {new Date(
                payment.dueDate
              ).toLocaleDateString("es-AR")}
            </td>

            <td>
              {payment.status === "paid"
                ? "✅ Pagado"
                : new Date(payment.dueDate) < new Date()
                ? "🚨 Demorado"
                : "⏳ Pendiente"}
            </td>

            <td>
              {payment.status !== "paid" && (
                <button
                  onClick={() =>
                    markAsPaid(payment.id)
                  }
                >
                  Marcar pagado
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}