import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const data = await req.json();

  const turn = await prisma.turn.update({
    where: {
      id: Number(id),
    },
    data: {
      status: data.status,
      date: data.date ? new Date(data.date) : undefined,
    },
  });

  return NextResponse.json(turn);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.turn.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({ ok: true });
}