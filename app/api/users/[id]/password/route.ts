import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

  const { id } =
    await context.params;

  const data = await req.json();

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      10
    );

  await prisma.user.update({
    where: {
      id: Number(id),
    },
    data: {
      password:
        hashedPassword,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}