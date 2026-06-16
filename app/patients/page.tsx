import PatientsClient from "./PatientsClient";

async function getPatients() {
  const res = await fetch(
    "http://localhost:3000/api/patients",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <main style={{ padding: 20 }}>
      <h1>👥 Pacientes</h1>

      <PatientsClient
        patients={patients}
      />
    </main>
  );
}