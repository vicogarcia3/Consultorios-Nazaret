
import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";

import prisma from "../../../../lib/prisma";
import { isAdmin } from "../../../../lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function listProviders() {
  return prisma.insuranceProvider.findMany({
    orderBy: { name: "asc" },
  });
}

// Solo eliminamos archivos que pertenecen a Vercel Blob.
// Las imágenes locales anteriores se conservan.
function isBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const hostname = new URL(url).hostname;

    return (
      hostname.endsWith(".public.blob.vercel-storage.com") ||
      hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

async function deleteOldLogo(url: string | null | undefined) {
  if (!isBlobUrl(url)) return;

  try {
    await del(url!);
  } catch (error) {
    console.warn(
      "No se pudo eliminar el logo anterior de Blob:",
      error
    );
  }
}

async function saveLogo(
  file: FormDataEntryValue | null
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  // Límite adecuado para cargas a través de la API de Vercel.
  if (file.size > 4 * 1024 * 1024) {
    throw new Error(
      "El logo no puede superar los 4 MB."
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  let extension: "jpg" | "png" | "webp" | null = null;
  let contentType: string | null = null;

  // Identificamos el formato real del archivo,
  // independientemente de su extensión o MIME declarado.
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
      "El logo debe ser una imagen JPG, PNG o WebP."
    );
  }

  const filename = `insurance-providers/${randomUUID()}.${extension}`;

  const blob = await put(filename, bytes, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    return Response.json(await listProviders());
  } catch (error) {
    console.error(
      "Error al obtener obras sociales:",
      error
    );

    return Response.json(
      { error: "No se pudieron cargar las obras sociales." },
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

  let uploadedLogo: string | null = null;

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

      const existing =
        await prisma.insuranceProvider.findUnique({
          where: { id },
        });

      if (!existing) {
        return Response.json(
          { error: "Obra social no encontrada." },
          { status: 404 }
        );
      }

      // Primero eliminamos el registro en Neon.
      await prisma.insuranceProvider.delete({
        where: { id },
      });

      // Después limpiamos su imagen, si está en Blob.
      await deleteOldLogo(existing.logoUrl);

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
        {
          error:
            "Ingresá un nombre válido (máximo 120 caracteres).",
        },
        { status: 400 }
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

    const duplicate =
      await prisma.insuranceProvider.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          ...(id ? { id: { not: id } } : {}),
        },
      });

    if (duplicate) {
      return Response.json(
        { error: "Ya existe una obra social con ese nombre." },
        { status: 409 }
      );
    }

    let logoUrl: string | null = existing?.logoUrl ?? null;

    const removeLogo = form.get("removeLogo") === "true";

    if (removeLogo) {
      logoUrl = null;
    }

    const newLogo = await saveLogo(form.get("logo"));

    if (newLogo) {
      uploadedLogo = newLogo;
      logoUrl = newLogo;
    }

    if (existing) {
      await prisma.insuranceProvider.update({
        where: { id },
        data: {
          name,
          logoUrl,
          active,
        },
      });
    } else {
      await prisma.insuranceProvider.create({
        data: {
          name,
          logoUrl,
          active,
        },
      });
    }

    // Ya guardamos la nueva URL correctamente en Neon.
    // Podemos eliminar el archivo anterior sin arriesgar
    // que el registro apunte a una imagen inexistente.
    if (
      existing?.logoUrl &&
      existing.logoUrl !== logoUrl
    ) {
      await deleteOldLogo(existing.logoUrl);
    }

    return Response.json({
      success: true,
      providers: await listProviders(),
    });
  } catch (error) {
    // Si subimos una imagen pero falló el guardado en Neon,
    // intentamos quitar esa imagen nueva para evitar
    // archivos huérfanos.
    if (uploadedLogo) {
      await deleteOldLogo(uploadedLogo);
    }

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
