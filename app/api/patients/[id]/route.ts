import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 📌 GET un paciente
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const patient = await prisma.patient.findUnique({
    where: { id: Number(id) },
    include: {
      plan: true,
      turns: { include: { doctor: true } },
      payments: true,
    },
  });

  return NextResponse.json(patient);
}

// 📌 PUT (editar paciente)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json();

  const updated = await prisma.patient.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      dni: data.dni,
      phone: data.phone,
      planId: data.planId
        ? Number(data.planId)
        : null,
      joinDate: data.joinDate ? new Date(data.joinDate) : null,
      nextCleaning: data.nextCleaning ? new Date(data.nextCleaning) : null,
      paymentStatus: data.paymentStatus,
      notes: data.notes,
    },
  });

  return NextResponse.json(updated);
}

// 📌 DELETE (eliminar paciente)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const numericId = Number(id);

  if (!numericId || isNaN(numericId)) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  await prisma.patient.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ ok: true });
}