import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const plans = await prisma.plan.findMany();
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
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

  const data = await req.json();

  const plan = await prisma.plan.create({
    data: {
      name: data.name,
      price: Number(data.price),
    },
  });

  return NextResponse.json(plan);
}