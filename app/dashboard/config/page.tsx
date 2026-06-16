"use client";

import { useEffect, useState } from "react";

export default function ConfigPage() {
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/config");
      const data = await res.json();
      setWhatsapp(data?.whatsapp || "");
    }

    load();
  }, []);

  async function save() {
    await fetch("/api/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ whatsapp }),
    });

    alert("Configuración guardada");
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Configuración del sistema</h1>

      <div style={{ marginTop: 20 }}>
        <label>Número de WhatsApp</label>
        <br />

        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej: 5493517049724"
          style={{
            padding: 10,
            marginTop: 8,
            width: 300,
          }}
        />

        <br /><br />

        <button onClick={save}>
          Guardar cambios
        </button>
      </div>
    </main>
  );
}