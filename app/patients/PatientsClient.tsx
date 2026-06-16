"use client";

import { useState } from "react";
import Link from "next/link";

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("es-AR");
}

export default function PatientsClient({
  patients,
}: {
  patients: any[];
}) {
  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      patient.dni
        ?.toString()
        .includes(search)
  );

  return (
    <>
      <input
        type="text"
        placeholder="🔎 Buscar por nombre o DNI..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 10,
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      {filteredPatients.length === 0 ? (
        <p>No se encontraron pacientes.</p>
      ) : (
        filteredPatients.map(
          (patient: any) => (
            <div
              key={patient.id}
              style={{
                border:
                  "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>
                <Link
                  href={`/patients/${patient.id}`}
                >
                  {patient.name}
                </Link>
              </h3>

              <p>
                <strong>DNI:</strong>{" "}
                {patient.dni}
              </p>

              <p>
                <strong>
                  Teléfono:
                </strong>{" "}
                {patient.phone || "-"}
              </p>

              <p>
                <strong>Plan:</strong>{" "}
                {patient.plan?.name ||
                  "Sin plan"}
              </p>

              <p>
                <strong>
                  Estado de pago:
                </strong>{" "}
                {patient.paymentStatus ===
                "al_dia"
                  ? "✅ Al día"
                  : "❌ Adeuda"}
              </p>

              <p>
                <strong>
                  Fecha de alta:
                </strong>{" "}
                {formatDate(
                  patient.joinDate
                )}
              </p>

              <p>
                <strong>
                  Próxima limpieza:
                </strong>{" "}
                {formatDate(
                  patient.nextCleaning
                )}
              </p>

              <p>
                <strong>
                  Observaciones:
                </strong>{" "}
                {patient.notes || "-"}
              </p>
            </div>
          )
        )
      )}
    </>
  );
}