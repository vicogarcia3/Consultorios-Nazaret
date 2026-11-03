
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isAdmin } from "../../../../lib/admin-access";
import prisma from "../../../../lib/prisma";
import { getClinicContent } from "../../../../lib/site-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Restricción temporal para desarrollo.
// No sustituye un sistema real de autenticación.
function isLocal(request: Request) {
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

// Obtener los datos actuales
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    const content = await getClinicContent();

    return Response.json({
      name: content.name,
      logoUrl: content.logoUrl,
      heroImageUrl: content.heroImageUrl,
      whatsapp: content.whatsapp,
      email: content.email,
    });
  } catch (error) {
    console.error("Error al obtener configuración:", error);

    return Response.json(
      { error: "No se pudo cargar la configuración." },
      { status: 500 }
    );
  }
}

// Guardar una imagen (temporalmente en disco local)
async function saveImage(
  value: FormDataEntryValue | null,
  prefix: string
): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > 15 * 1024 * 1024) {
    throw new Error("La imagen supera el límite de 15 MB.");
  }

  const bytes = Buffer.from(await value.arrayBuffer());

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
    throw new Error("La imagen debe ser JPG, PNG o WebP.");
  }

  const directory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "general"
  );

  await fs.mkdir(directory, { recursive: true });

  const filename = `${prefix}-${randomUUID()}.${extension}`;

  await fs.writeFile(
    path.join(directory, filename),
    bytes
  );

  return `/uploads/general/${filename}`;
}

// Guardar la configuración en Neon
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Edición disponible solo en desarrollo local." },
      { status: 403 }
    );
  }

  try {
    const form = await request.formData();

    const name = String(form.get("name") ?? "").trim();
    const whatsapp = String(form.get("whatsapp") ?? "")
      .replace(/\D/g, "");
    const email = String(form.get("email") ?? "").trim();

    if (!name) {
      return Response.json(
        { error: "El nombre del consultorio es obligatorio." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    const current = await prisma.siteConfig.findUnique({
      where: { id: 1 },
    });

    const logo =
      (await saveImage(form.get("logo"), "logo")) ??
      current?.logoUrl ??
      null;

    const hero =
      (await saveImage(form.get("hero"), "portada")) ??
      current?.heroImageUrl ??
      null;

    const settings = await prisma.siteConfig.upsert({
      where: { id: 1 },

      create: {
        id: 1,
        name,
        whatsapp: whatsapp || null,
        email: email || null,
        logoUrl: logo,
        heroImageUrl: hero,
      },

      update: {
        name,
        whatsapp: whatsapp || null,
        email: email || null,
        logoUrl: logo,
        heroImageUrl: hero,
      },
    });

    return Response.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error al guardar configuración:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración.",
      },
      { status: 500 }
    );
  }
}
