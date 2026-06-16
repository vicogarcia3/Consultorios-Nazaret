import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await context.params;

  const budget = await prisma.budget.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      patient: true,
    },
  });

  if (!budget) {
    return new Response(
      "Presupuesto no encontrado",
      {
        status: 404,
      }
    );
  }

  const doc = new PDFDocument();

  const chunks: Buffer[] = [];

  doc.on("data", (chunk) =>
    chunks.push(chunk)
  );

  const pdfPromise = new Promise<Buffer>(
    (resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    }
  );

  doc.fontSize(22);
  doc.text("PLAN NAZARET");

  doc.moveDown();

  doc.fontSize(16);
  doc.text(
    `Paciente: ${budget.patient.name}`
  );

  doc.text(
    `Fecha: ${new Date(
      budget.createdAt
    ).toLocaleDateString("es-AR")}`
  );

  doc.moveDown();

  doc.text("Detalle:");

  doc.moveDown();

  doc.fontSize(12);
  doc.text(
    budget.treatments || "Sin detalle"
  );

  doc.moveDown();

  doc.fontSize(18);
  doc.text(
    `TOTAL: $${budget.total.toLocaleString(
      "es-AR"
    )}`
  );

  doc.moveDown(3);

  doc.text(
    "____________________________"
  );

  doc.text("Firma");

  doc.end();

  const pdf = await pdfPromise;

  return new Response(pdf, {
    headers: {
      "Content-Type":
        "application/pdf",
      "Content-Disposition":
        `inline; filename=presupuesto-${budget.id}.pdf`,
    },
  });
}