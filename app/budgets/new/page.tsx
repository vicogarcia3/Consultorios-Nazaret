"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBudgetPage() {
  const router = useRouter();

  const [patients, setPatients] =
    useState<any[]>([]);

  const [patientId, setPatientId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [items, setItems] = useState<
    {
      description: string;
      price: number;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then(setPatients);
  }, []);

  function addItem() {
    if (!description || !price) return;

    setItems([
      ...items,
      {
        description,
        price: Number(price),
      },
    ]);

    setDescription("");
    setPrice("");
  }

  const total = items.reduce(
    (acc, item) => acc + item.price,
    0
  );

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const treatments = items
      .map(
        (item) =>
          `${item.description} - $${item.price}`
      )
      .join("\n");

    const res = await fetch(
      "/api/budgets",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          patientId,
          treatments,
          total,
        }),
      }
    );

    if (res.ok) {
      router.push("/budgets");
    } else {
      alert(
        "Error al guardar presupuesto"
      );
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>📄 Nuevo presupuesto</h1>

      <form onSubmit={handleSubmit}>
        <select
          value={patientId}
          onChange={(e) =>
            setPatientId(
              e.target.value
            )
          }
        >
          <option value="">
            Seleccione paciente
          </option>

          {patients.map((p) => (
            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}
        </select>

        <hr
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        <h3>
          Agregar tratamiento
        </h3>

        <input
          placeholder="Descripción"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={(e) =>
            setPrice(
              e.target.value
            )
          }
          style={{
            marginLeft: 10,
          }}
        />

        <button
          type="button"
          onClick={addItem}
          style={{
            marginLeft: 10,
          }}
        >
          ➕ Agregar
        </button>

        <hr
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        <h3>Tratamientos</h3>

        {items.length === 0 ? (
          <p>
            No hay tratamientos
            agregados
          </p>
        ) : (
          items.map(
            (item, index) => (
              <div
                key={index}
                style={{
                  padding: 10,
                  border:
                    "1px solid #ddd",
                  marginBottom: 10,
                  borderRadius: 8,
                }}
              >
                <strong>
                  {
                    item.description
                  }
                </strong>

                <div>
                  $
                  {item.price.toLocaleString(
                    "es-AR"
                  )}
                </div>
              </div>
            )
          )
        )}

        <h2>
          Total: $
          {total.toLocaleString(
            "es-AR"
          )}
        </h2>

        <button
          type="submit"
          disabled={
            !patientId ||
            items.length === 0
          }
        >
          Guardar presupuesto
        </button>
      </form>
    </main>
  );
}