import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      patient: true,
    },
  });

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const data = await req.json();

  const payment = await prisma.payment.create({
    data: {
      patientId: data.patientId,
      amount: data.amount,
      month: data.month,
      dueDate: new Date(data.dueDate),
    },
  });

  return NextResponse.json(payment);
}