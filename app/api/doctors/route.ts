import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();

  const doctor = await prisma.doctor.create({
    data: {
      name: data.name,
      specialty: data.specialty,
      photo: data.photo,
    },
  });

  return NextResponse.json(doctor);
}