
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import prisma from "../../../../lib/prisma";
import { isAdmin } from "../../../../lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Provisional: únicamente para desarrollo local.
// Antes de publicar, reemplazar por autenticación y roles.
function isLocal(request: Request) {
  if (process.env.NODE_ENV !== "development") return false;

  const host = request.headers.get("host") ?? "";
  const origin = request.headers.get("origin");

  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return false;
  }

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  return true;
}

async function listProviders() {
  return prisma.insuranceProvider.findMany({
    orderBy: { name: "asc" },
  });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    return Response.json(await listProviders());
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "No se pudieron cargar las obras sociales." },
      { status: 500 }
    );
  }
}

async function saveLogo(
  file: FormDataEntryValue | null
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("El logo no puede superar los 5 MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
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
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    extension = "webp";
  }

  if (!extension) {
    throw new Error("El logo debe ser JPG, PNG o WebP.");
  }

  const directory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "insurance-providers"
  );

  await fs.mkdir(directory, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;

  await fs.writeFile(
    path.join(directory, filename),
    bytes
  );

  return `/uploads/insurance-providers/${filename}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Edición disponible solo en desarrollo local." },
      { status: 403 }
    );
  }

  try {
    const form = await request.formData();
    const action = String(form.get("action") ?? "save");
    const id = String(form.get("id") ?? "").trim();

    if (action === "delete") {
      if (!id) {
        return Response.json(
          { error: "Falta identificar la obra social." },
          { status: 400 }
        );
      }

      const existing = await prisma.insuranceProvider.findUnique({
        where: { id },
      });

      if (!existing) {
        return Response.json(
          { error: "Obra social no encontrada." },
          { status: 404 }
        );
      }

      await prisma.insuranceProvider.delete({
        where: { id },
      });

      return Response.json({
        success: true,
        providers: await listProviders(),
      });
    }

    if (action !== "save") {
      return Response.json(
        { error: "Operación no válida." },
        { status: 400 }
      );
    }

    const name = String(form.get("name") ?? "").trim();
    const active = form.get("active") === "true";

    if (!name || name.length > 120) {
      return Response.json(
        { error: "Ingresá un nombre válido (máximo 120 caracteres)." },
        { status: 400 }
      );
    }

    const duplicate = await prisma.insuranceProvider.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        ...(id ? { id: { not: id } } : {}),
      },
    });

    if (duplicate) {
      return Response.json(
        { error: "Ya existe una obra social con ese nombre." },
        { status: 409 }
      );
    }

    const existing = id
      ? await prisma.insuranceProvider.findUnique({
          where: { id },
        })
      : null;

    if (id && !existing) {
      return Response.json(
        { error: "Obra social no encontrada." },
        { status: 404 }
      );
    }

    let logoUrl = existing?.logoUrl ?? null;

    if (form.get("removeLogo") === "true") {
      logoUrl = null;
    }

    const uploadedLogo = await saveLogo(form.get("logo"));

    if (uploadedLogo) {
      logoUrl = uploadedLogo;
    }

    if (id) {
      await prisma.insuranceProvider.update({
        where: { id },
        data: { name, logoUrl, active },
      });
    } else {
      await prisma.insuranceProvider.create({
        data: { name, logoUrl, active },
      });
    }

    return Response.json({
      success: true,
      providers: await listProviders(),
    });
  } catch (error) {
    console.error("Error en obras sociales:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la obra social.",
      },
      { status: 500 }
    );
  }
}
