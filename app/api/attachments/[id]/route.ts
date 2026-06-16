import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("DELETE ID RECEIVED:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 400 }
    );
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id },
  });

  if (!attachment) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  await prisma.attachment.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}