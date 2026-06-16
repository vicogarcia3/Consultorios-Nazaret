import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const existing =
    await prisma.odontogram.findFirst({
      where: {
        patientId: Number(data.patientId),
        tooth: Number(data.tooth),
      },
    });

  if (existing) {
    const updated =
      await prisma.odontogram.update({
        where: {
          id: existing.id,
        },
        data: {
          status: data.status,
        },
      });

    return NextResponse.json(updated);
  }

  const record =
    await prisma.odontogram.create({
      data: {
        patientId: Number(data.patientId),
        tooth: Number(data.tooth),
        status: data.status,
      },
    });

  return NextResponse.json(record);
}