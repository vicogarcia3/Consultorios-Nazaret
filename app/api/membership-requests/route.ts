import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const request =
    await prisma.membershipRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        planId: Number(data.planId),
      },
    });

  return NextResponse.json(request);
}