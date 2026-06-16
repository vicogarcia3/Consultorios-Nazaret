import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET plan
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const plan = await prisma.plan.findUnique({
    where: { id: Number(id) },
  });

  return NextResponse.json(plan);
}

// PUT plan
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session =
  await getServerSession(authOptions);

if (
  (session?.user as any)?.role !==
  "admin"
) {
  return NextResponse.json(
    { error: "No autorizado" },
    { status: 403 }
  );
}
  const { id } = await context.params;
  const data = await req.json();

  const updated = await prisma.plan.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      benefits: data.benefits,
    },
  });

  return NextResponse.json(updated);
}

// DELETE plan
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session =
  await getServerSession(authOptions);

if (
  (session?.user as any)?.role !==
  "admin"
) {
  return NextResponse.json(
    { error: "No autorizado" },
    { status: 403 }
  );
}
  const { id } = await context.params;

  await prisma.plan.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ ok: true });
}