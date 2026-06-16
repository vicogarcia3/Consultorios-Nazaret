import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const payment = await prisma.payment.update({
    where: {
      id: Number(id),
    },
    data: {
      status: "Paid",
      paidDate: new Date(),
    },
  });

  return NextResponse.json(payment);
}