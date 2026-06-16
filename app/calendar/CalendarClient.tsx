"use client";

export default function CalendarClient({
  turns,
}: any) {
  async function markCompleted(
    turnId: number
  ) {
    await fetch(
      `/api/turns/${turnId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          status: "completed",
        }),
      }
    );

    location.reload();
  }

  async function cancelTurn(
    turnId: number
  ) {
    const ok = confirm(
      "¿Cancelar este turno?"
    );

    if (!ok) return;

    await fetch(
      `/api/turns/${turnId}`,
      {
        method: "DELETE",
      }
    );

    location.reload();
  }

  async function rescheduleTurn(
    turnId: number
  ) {
    const newDate = prompt(
      "Nueva fecha y hora (AAAA-MM-DDTHH:mm)"
    );

    if (!newDate) return;

    const res = await fetch(
      `/api/turns/${turnId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          date: newDate,
        }),
      }
    );

    if (res.ok) {
      location.reload();
    } else {
      alert(
        "Error al reprogramar"
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 20,
      }}
    >
      {turns.map((turn: any) => (
        <div
          key={turn.id}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>
            {new Date(
              turn.date
            ).toLocaleString("es-AR")}
          </h3>

          <p>
            👤 {turn.patient.name}
          </p>

          <p>
            👨‍⚕️ {turn.doctor.name}
          </p>

          <p>
            🩺 {turn.doctor.specialty}
          </p>

          <p>
            Estado:{" "}
            {turn.status ===
            "completed"
              ? "✅ Realizado"
              : "⏳ Pendiente"}
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            {turn.status !==
              "completed" && (
              <button
                onClick={() =>
                  markCompleted(
                    turn.id
                  )
                }
              >
                ✅ Realizado
              </button>
            )}

            <button
              onClick={() =>
                rescheduleTurn(
                  turn.id
                )
              }
            >
              ✏️ Reprogramar
            </button>

            <button
              onClick={() =>
                cancelTurn(
                  turn.id
                )
              }
              style={{
                color: "red",
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}