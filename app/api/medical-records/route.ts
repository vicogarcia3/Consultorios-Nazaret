import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: Number(data.patientId),
        title: data.title,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}