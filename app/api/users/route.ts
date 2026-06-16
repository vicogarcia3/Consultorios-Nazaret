import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(users);
}

export async function POST(
  req: Request
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

  const data = await req.json();

  const hashedPassword =
    await bcrypt.hash(
      data.password,
      10
    );

  const user =
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

  return NextResponse.json(user);
}