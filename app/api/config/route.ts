import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.config.findFirst();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const data = await req.json();

  const config = await prisma.config.findFirst();

  if (!config) {
    const newConfig = await prisma.config.create({
      data: {
        whatsapp: data.whatsapp,
      },
    });

    return NextResponse.json(newConfig);
  }

  const updated = await prisma.config.update({
    where: { id: config.id },
    data: {
      whatsapp: data.whatsapp,
    },
  });

  return NextResponse.json(updated);
}