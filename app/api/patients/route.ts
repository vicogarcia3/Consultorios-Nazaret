import { prisma } from "@/lib/prisma";

export async function GET() {
  return Response.json(
    await prisma.patient.findMany({
      include: {
        plan: true,
      },
    })
  );
}

export async function POST(req: Request) {
  const data = await req.json();

  return Response.json(
    await prisma.patient.create({
      data: {
        name: data.name,
        dni: data.dni,
        phone: data.phone,

        planId: data.planId,

        joinDate: data.joinDate
          ? new Date(data.joinDate)
          : null,

        nextCleaning: data.nextCleaning
          ? new Date(data.nextCleaning)
          : null,

        paymentStatus:
          data.paymentStatus || "al_dia",

        notes: data.notes || null,
      },
      include: {
        plan: true,
      },
    })
  );
}