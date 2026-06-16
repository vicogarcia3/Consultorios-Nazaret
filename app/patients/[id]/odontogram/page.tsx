"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];

const statusOptions = [
  "sano",
  "caries",
  "endodoncia",
  "corona",
  "implante",
  "extraido",
];

const statusColors: Record<string, string> = {
  sano: "#E5E7EB",
  caries: "#FCA5A5",
  endodoncia: "#93C5FD",
  corona: "#FCD34D",
  implante: "#86EFAC",
  extraido: "#9CA3AF",
};

export default function OdontogramPage() {
  const params = useParams();
  const id = params.id as string;

  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const res = await fetch(`/api/odontogram/${id}`);
    const data = await res.json();

    setRecords(data);
  }

  async function updateTooth(
    tooth: number,
    status: string
  ) {
    await fetch("/api/odontogram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patientId: id,
        tooth,
        status,
      }),
    });

    loadData();
  }

  function getStatus(tooth: number) {
    return (
      records.find(
        (r) => r.tooth === tooth
      )?.status || "sano"
    );
  }

  function ToothButton({
    tooth,
  }: {
    tooth: number;
  }) {
    const status = getStatus(tooth);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <button
          style={{
            width: 50,
            height: 50,
            borderRadius: 13,
            border: "1px solid #D1D5DB",
            background:
              statusColors[status],
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {tooth}
        </button>

        <select
          value={status}
          onChange={(e) =>
            updateTooth(
              tooth,
              e.target.value
            )
          }
          style={{
            width: 95,
            fontSize: 12,
          }}
        >
          {statusOptions.map((opt) => (
            <option
              key={opt}
              value={opt}
            >
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function Quadrant({
    teeth,
  }: {
    teeth: number[];
  }) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 90px)",
          gap: 10,
        }}
      >
        {teeth.map((tooth) => (
          <ToothButton
            key={tooth}
            tooth={tooth}
          />
        ))}
      </div>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>🦷 Odontograma</h1>

      <p>
        Seleccioná el estado de cada
        pieza dental.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 25,
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 30,
          }}
        >
          <Quadrant teeth={upperLeft} />
          <Quadrant teeth={upperRight} />
        </div>

        <hr />

        <div
          style={{
            display: "flex",
            gap: 30,
          }}
        >
          <Quadrant teeth={lowerLeft} />
          <Quadrant teeth={lowerRight} />
        </div>
      </div>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        {statusOptions.map((status) => (
          <div
            key={status}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  statusColors[status],
              }}
            />

            <span>
              {status}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}