
import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";

import { isAdmin } from "../../../../lib/admin-access";
import prisma from "../../../../lib/prisma";
import { getClinicContent } from "../../../../lib/site-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Obtener los datos actuales de la configuración.
export async function GET() {
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

// Guardar una imagen en Vercel Blob.
async function saveImage(
  value: FormDataEntryValue | null,
  prefix: "logo" | "portada"
): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  // Dejamos un margen respecto al límite de las
  // solicitudes de las funciones de Vercel.
  if (value.size > 4 * 1024 * 1024) {
    throw new Error(
      "La imagen no puede superar los 4 MB."
    );
  }

  const bytes = Buffer.from(await value.arrayBuffer());

  let extension: "jpg" | "png" | "webp" | null = null;
  let contentType: string | null = null;

  // Verificamos el formato real de la imagen,
  // incluso si su extensión original es incorrecta.
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    extension = "jpg";
    contentType = "image/jpeg";
  } else if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    extension = "png";
    contentType = "image/png";
  } else if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    extension = "webp";
    contentType = "image/webp";
  }

  if (!extension || !contentType) {
    throw new Error(
      "La imagen debe ser JPG, PNG o WebP."
    );
  }

  const filename = `general/${prefix}-${randomUUID()}.${extension}`;

  const blob = await put(filename, bytes, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return blob.url;
}

// Guardar la configuración en Neon.
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  const uploadedUrls: string[] = [];
  let savedInDatabase = false;

  try {
    const form = await request.formData();

    const name = String(form.get("name") ?? "").trim();

    const whatsapp = String(
      form.get("whatsapp") ?? ""
    ).replace(/\D/g, "");

    const email = String(
      form.get("email") ?? ""
    ).trim();

    if (!name) {
      return Response.json(
        { error: "El nombre del consultorio es obligatorio." },
        { status: 400 }
      );
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    const current = await prisma.siteConfig.findUnique({
      where: { id: 1 },
    });

    // Conservamos las imágenes actuales si no se
    // selecciona un archivo nuevo.
    let logoUrl = current?.logoUrl ?? null;
    let heroImageUrl = current?.heroImageUrl ?? null;

    const newLogo = await saveImage(
      form.get("logo"),
      "logo"
    );

    if (newLogo) {
      uploadedUrls.push(newLogo);
      logoUrl = newLogo;
    }

    const newHero = await saveImage(
      form.get("hero"),
      "portada"
    );

    if (newHero) {
      uploadedUrls.push(newHero);
      heroImageUrl = newHero;
    }

    const settings = await prisma.siteConfig.upsert({
      where: { id: 1 },

      create: {
        id: 1,
        name,
        whatsapp: whatsapp || null,
        email: email || null,
        logoUrl,
        heroImageUrl,
      },

      update: {
        name,
        whatsapp: whatsapp || null,
        email: email || null,
        logoUrl,
        heroImageUrl,
      },
    });

    savedInDatabase = true;

    return Response.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    // Si falló el guardado, intentamos limpiar
    // las imágenes nuevas que se hayan subido.
    if (!savedInDatabase) {
      for (const url of uploadedUrls) {
        try {
          await del(url);
        } catch (cleanupError) {
          console.warn(
            "No se pudo limpiar la imagen nueva de Blob:",
            cleanupError
          );
        }
      }
    }

    console.error(
      "Error al guardar configuración:",
      error
    );

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
