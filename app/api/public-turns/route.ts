import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  let patient = await prisma.patient.findUnique({
    where: {
      dni: data.dni,
    },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: data.name,
        dni: data.dni,
        phone: data.phone,
      },
    });
  }

  const existingTurn = await prisma.turn.findFirst({
    where: {
      doctorId: Number(data.doctorId),
      date: new Date(data.date),
    },
  });

  if (existingTurn) {
    return NextResponse.json(
      {
        error: "Ese horario ya está reservado",
      },
      { status: 400 }
    );
  }

  const turn = await prisma.turn.create({
    data: {
      patientId: patient.id,
      doctorId: Number(data.doctorId),
      date: new Date(data.date),
    },
  });

  return NextResponse.json(turn);
}