
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import prisma from "../../../../lib/prisma";
import { isAdmin } from "../../../../lib/admin-access";

export const runtime = "nodejs";

// Obtener los profesionales con sus sucursales.
async function getProfessionals() {
  const professionals = await prisma.professional.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      branches: {
        select: { branchId: true },
      },
    },
  });

  return professionals.map((person) => ({
    id: person.id,
    name: person.name,
    license: person.license,
    specialties: person.specialties,
    imageUrl: person.imageUrl,
    active: person.active,
    branchIds: person.branches.map(
      (item) => item.branchId
    ),
  }));
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    const [professionals, branches] = await Promise.all([
      getProfessionals(),
      prisma.branch.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return Response.json({
      professionals,
      branches,
    });
  } catch (error) {
    console.error("Error al obtener profesionales:", error);

    return Response.json(
      { error: "No se pudieron cargar los profesionales." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    const form = await request.formData();

    const action = String(form.get("action") ?? "save");
    const id = String(form.get("id") ?? "").trim();

    const existing = id
      ? await prisma.professional.findUnique({
          where: { id },
          select: {
            id: true,
            imageUrl: true,
          },
        })
      : null;

    if (action === "delete") {
      if (!id || !existing) {
        return Response.json(
          { error: "Profesional no encontrado." },
          { status: 404 }
        );
      }

      await prisma.professional.delete({
        where: { id },
      });

      return Response.json({
        success: true,
        professionals: await getProfessionals(),
      });
    }

    if (action !== "save") {
      return Response.json(
        { error: "Operación no válida." },
        { status: 400 }
      );
    }

    if (id && !existing) {
      return Response.json(
        { error: "Profesional no encontrado." },
        { status: 404 }
      );
    }

    const name = String(form.get("name") ?? "").trim();
    const license = String(form.get("license") ?? "").trim();

    let specialties: string[];
    let branchIds: string[];

    try {
      specialties = JSON.parse(
        String(form.get("specialties") ?? "[]")
      );

      branchIds = JSON.parse(
        String(form.get("branchIds") ?? "[]")
      );
    } catch {
      return Response.json(
        { error: "Especialidades o sucursales inválidas." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(specialties) ||
      !specialties.every(
        (value) => typeof value === "string"
      ) ||
      !Array.isArray(branchIds) ||
      !branchIds.every(
        (value) => typeof value === "string"
      )
    ) {
      return Response.json(
        { error: "Datos de especialidades o sucursales inválidos." },
        { status: 400 }
      );
    }

    specialties = [
      ...new Set(
        specialties.map((s) => s.trim()).filter(Boolean)
      ),
    ];

    branchIds = [
      ...new Set(branchIds),
    ];

    if (!name || !license) {
      return Response.json(
        { error: "Ingresá el nombre y la matrícula." },
        { status: 400 }
      );
    }

    if (specialties.length === 0) {
      return Response.json(
        { error: "Agregá al menos una especialidad." },
        { status: 400 }
      );
    }

    if (branchIds.length === 0) {
      return Response.json(
        { error: "Seleccioná al menos una sucursal." },
        { status: 400 }
      );
    }

    const validBranches = await prisma.branch.findMany({
      where: {
        id: { in: branchIds },
      },
      select: { id: true },
    });

    if (validBranches.length !== branchIds.length) {
      return Response.json(
        { error: "Seleccionaste una sucursal inválida." },
        { status: 400 }
      );
    }

    let imageUrl: string | null =
      existing?.imageUrl ?? null;

    if (form.get("removeImage") === "true") {
      imageUrl = null;
    }

    const image = form.get("image");

    if (image instanceof File && image.size > 0) {
      if (image.size > 15 * 1024 * 1024) {
        return Response.json(
          { error: "La imagen supera los 15 MB." },
          { status: 400 }
        );
      }

      const bytes = Buffer.from(
        await image.arrayBuffer()
      );

      let extension: "jpg" | "png" | "webp" | null = null;

      if (
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      ) {
        extension = "jpg";
      } else if (
        bytes.length >= 8 &&
        bytes.subarray(0, 8).equals(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        )
      ) {
        extension = "png";
      } else if (
        bytes.length >= 12 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 4) === "WEBP"
      ) {
        extension = "webp";
      }

      if (!extension) {
        return Response.json(
          {
            error:
              "El archivo debe ser una imagen JPG, PNG o WebP.",
          },
          { status: 400 }
        );
      }

      const directory = path.join(
        process.cwd(),
        "public",
        "uploads",
        "professionals"
      );

      await fs.mkdir(directory, {
        recursive: true,
      });

      const filename = `${randomUUID()}.${extension}`;

      await fs.writeFile(
        path.join(directory, filename),
        bytes
      );

      imageUrl = `/uploads/professionals/${filename}`;
    }

    const active = form.get("active") === "true";

    if (existing) {
      await prisma.professional.update({
        where: { id },
        data: {
          name,
          license,
          specialties,
          imageUrl,
          active,
          branches: {
            deleteMany: {},
            create: branchIds.map((branchId) => ({
              branch: {
                connect: { id: branchId },
              },
            })),
          },
        },
      });
    } else {
      await prisma.professional.create({
        data: {
          name,
          license,
          specialties,
          imageUrl,
          active,
          branches: {
            create: branchIds.map((branchId) => ({
              branch: {
                connect: { id: branchId },
              },
            })),
          },
        },
      });
    }

    return Response.json({
      success: true,
      professionals: await getProfessionals(),
    });
  } catch (error) {
    console.error("Error al guardar profesionales:", error);

    return Response.json(
      { error: "No se pudo guardar el profesional." },
      { status: 500 }
    );
  }
}
