import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

import prisma from "../../../../lib/prisma";
import { isAdmin } from "../../../../lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getServices() {
  const rows = await prisma.service.findMany({
    orderBy: { createdAt: "asc" },
  });

  return rows.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description ?? "",
    imageUrl: service.imageUrl,
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
    return Response.json(await getServices());
  } catch (error) {
    console.error("Error al cargar servicios:", error);

    return Response.json(
      { error: "No se pudieron cargar los servicios." },
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

    if (action === "delete") {
      if (!id) {
        return Response.json(
          { error: "Falta identificar el servicio." },
          { status: 400 }
        );
      }

      const existing = await prisma.service.findUnique({
        where: { id },
      });

      if (!existing) {
        return Response.json(
          { error: "Servicio no encontrado." },
          { status: 404 }
        );
      }

      await prisma.service.delete({
        where: { id },
      });

      return Response.json({
        success: true,
        services: await getServices(),
      });
    }

    if (action !== "save") {
      return Response.json(
        { error: "Operación no válida." },
        { status: 400 }
      );
    }

    const title = String(
      form.get("title") ?? ""
    ).trim();

    const description = String(
      form.get("description") ?? ""
    ).trim();

    if (!title) {
      return Response.json(
        { error: "Ingresá el nombre del servicio." },
        { status: 400 }
      );
    }

    if (title.length > 150 || description.length > 5000) {
      return Response.json(
        { error: "El título o la descripción es demasiado largo." },
        { status: 400 }
      );
    }

    const existing = id
      ? await prisma.service.findUnique({
          where: { id },
        })
      : null;

    if (id && !existing) {
      return Response.json(
        { error: "Servicio no encontrado." },
        { status: 404 }
      );
    }

    let imageUrl = existing?.imageUrl ?? null;

    if (form.get("removeImage") === "true") {
      imageUrl = null;
    }

    const image = form.get("image");

    if (image instanceof File && image.size > 0) {
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensions[image.type];

      if (!extension) {
        return Response.json(
          {
            error:
              "Seleccioná una imagen JPG, PNG o WebP.",
          },
          { status: 400 }
        );
      }

      if (image.size > 15 * 1024 * 1024) {
        return Response.json(
          {
            error: "La imagen supera el límite de 15 MB.",
          },
          { status: 400 }
        );
      }

      const filename = `services/${randomUUID()}.${extension}`;

      const blob = await put(filename, image, {
        access: "public",
        addRandomSuffix: false,
        contentType: image.type,
      });

      imageUrl = blob.url;
    }

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          imageUrl,
        },
      });
    } else {
      await prisma.service.create({
        data: {
          title,
          description,
          imageUrl,
        },
      });
    }

    return Response.json({
      success: true,
      services: await getServices(),
    });
  } catch (error) {
    console.error("Error al guardar servicio:", error);

    return Response.json(
      { error: "No se pudo guardar el servicio." },
      { status: 500 }
    );
  }
}
