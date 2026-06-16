import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const budgets = await prisma.budget.findMany({
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const data = await req.json();

  const budget = await prisma.budget.create({
    data: {
      patientId: Number(data.patientId),
      treatments: data.treatments,
      total: Number(data.total),
    },
  });

  return NextResponse.json(budget);
}