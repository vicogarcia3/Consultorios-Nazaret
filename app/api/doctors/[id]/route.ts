import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctorId = Number(id);

    await prisma.doctor.delete({
      where: { id: doctorId },
    });

    return NextResponse.json({ message: "Doctor eliminado" });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// 👉 NUEVO: EDITAR DOCTOR
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doctorId = Number(id);

    const data = await req.json();

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        name: data.name,
        specialty: data.specialty,
        photo: data.photo,
      },
    });

    return NextResponse.json(updatedDoctor);
  } catch (error: any) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}