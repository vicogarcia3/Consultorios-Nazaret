import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{ patientId: string }>;
  }
) {
  const { patientId } =
    await context.params;

  const teeth =
    await prisma.odontogram.findMany({
      where: {
        patientId: Number(patientId),
      },
    });

  return NextResponse.json(teeth);
}