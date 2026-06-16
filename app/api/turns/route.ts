import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const turns = await prisma.turn.findMany({
    include: {
      patient: true,
      doctor: true,
    },
  });

  return NextResponse.json(turns);
}

export async function POST(req: Request) {
  const data = await req.json();

  const turn = await prisma.turn.create({
    data: {
      patientId: Number(data.patientId),
      doctorId: Number(data.doctorId),
      date: new Date(data.date),
    },
  });

  return NextResponse.json(turn);
}