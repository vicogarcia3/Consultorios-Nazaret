import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UploadAttachment from "@/app/components/UploadAttachment";
import DeleteAttachmentButton from "@/components/DeleteAttachmentButton";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patientId = Number(id);

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
    include: {
      plan: true,

      medicalRecords: {
        orderBy: {
          createdAt: "desc",
        },
      },

      turns: {
        include: {
          doctor: true,
        },
        orderBy: {
          date: "desc",
        },
      },

      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },

      budgets: {
        orderBy: {
          createdAt: "desc",
        },
      },

      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!patient) {
    return <p>Paciente no encontrado</p>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>{patient.name}</h1>

      <p>
        <strong>DNI:</strong> {patient.dni}
      </p>

      <p>
        <strong>Teléfono:</strong> {patient.phone || "-"}
      </p>

      <p>
        <strong>Plan:</strong> {patient.plan?.name || "Sin plan"}
      </p>

      <br />

      <Link href={`/patients/${patient.id}/records/new`}>
        <button>➕ Nueva consulta</button>
      </Link>

      <Link
        href={`/patients/${patient.id}/odontogram`}
      >
        <button>
          🦷 Ver odontograma
        </button>
      </Link>

      <Link href={`/patients/${patient.id}/edit`}>
        <button style={{ marginLeft: 10 }}>✏️ Editar paciente</button>
      </Link>

      <hr />

      {/* 📎 ADJUNTOS */}
      <h2>📎 Adjuntos</h2>

      <UploadAttachment patientId={patientId} />

      <br />

      {patient.attachments.length === 0 ? (
        <p>No hay archivos adjuntos.</p>
      ) : (
        patient.attachments.map((file) => (
          <div
            key={file.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <a href={file.fileUrl} 
               target="_blank"
               style={{
                color: "black",
                fontWeight: 500,
                textDecoration: "underline",
                wordBreak: "break-word",
               }}
            >
              {file.fileName}
            </a>

            {/* 🗑️ DELETE (CLIENT COMPONENT) */}
            <DeleteAttachmentButton id={file.id} />
          </div>
        ))
      )}

      <hr />

      {/* 🧠 HISTORIA CLÍNICA */}
      <h2>Historia clínica</h2>

      {patient.medicalRecords.length === 0 ? (
        <p>No hay consultas registradas.</p>
      ) : (
        patient.medicalRecords.map((record) => (
          <div
            key={record.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
            }}
          >
            <h3>{record.title}</h3>

            <p>
              <strong>Diagnóstico:</strong> {record.diagnosis || "-"}
            </p>

            <p>
              <strong>Tratamiento:</strong> {record.treatment || "-"}
            </p>

            <p>
              <strong>Observaciones:</strong> {record.notes || "-"}
            </p>

            <small>
              {new Date(record.createdAt).toLocaleDateString("es-AR")}
            </small>
          </div>
        ))
      )}

      <hr />

      {/* 📅 TURNOS */}
      <h2>📅 Turnos</h2>

      {patient.turns.length === 0 ? (
        <p>No tiene turnos.</p>
      ) : (
        patient.turns.map((turn) => (
          <div
            key={turn.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <p>{new Date(turn.date).toLocaleString("es-AR")}</p>

            <p>{turn.doctor.name}</p>

            <p>Estado: {turn.status}</p>
          </div>
        ))
      )}

      <hr />

      {/* 💳 PAGOS */}
      <h2>💳 Pagos</h2>

      {patient.payments.length === 0 ? (
        <p>No tiene pagos registrados.</p>
      ) : (
        patient.payments.map((payment) => (
          <div
            key={payment.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <p>${payment.amount.toLocaleString("es-AR")}</p>

            <p>Estado: {payment.status}</p>
          </div>
        ))
      )}

      <hr />

      {/* 📄 PRESUPUESTOS */}
      <h2>📄 Presupuestos</h2>

      {patient.budgets.length === 0 ? (
        <p>No tiene presupuestos.</p>
      ) : (
        patient.budgets.map((budget) => (
          <div
            key={budget.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <p>Presupuesto #{budget.id}</p>

            <p>${budget.total.toLocaleString("es-AR")}</p>

            <p>
              {new Date(budget.createdAt).toLocaleDateString("es-AR")}
            </p>
          </div>
        ))
      )}
    </main>
  );
}