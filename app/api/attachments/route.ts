import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const attachment = await prisma.attachment.create({
    data: {
      patientId: body.patientId,
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
    },
  });

  return NextResponse.json(attachment);
}