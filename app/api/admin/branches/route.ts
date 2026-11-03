
import { getClinicContent } from "../../../../lib/site-data";
import prisma from "../../../../lib/prisma";
import { isAdmin } from "../../../../lib/admin-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Acceso provisional para pruebas locales.
// Antes de publicar necesitaremos autenticación real.
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

function normalizeInstagram(value: string): string | null {
  const text = value.trim();

  if (!text) return null;

  let username = text;

  if (/^https?:\/\//i.test(text)) {
    const url = new URL(text);

    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(
        url.hostname.toLowerCase()
      )
    ) {
      throw new Error("Ingresá un enlace válido de Instagram.");
    }

    username = url.pathname.split("/").filter(Boolean)[0] ?? "";
  } else {
    username = text.replace(/^@/, "");
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Ingresá un usuario válido de Instagram.");
  }

  return `https://www.instagram.com/${username}/`;
}

function normalizeMaps(value: string): string | null {
  const text = value.trim();
  if (!text) return null;

  let url: URL;

  try {
    url = new URL(text);
  } catch {
    throw new Error("Ingresá un enlace válido de Google Maps.");
  }

  if (url.protocol !== "https:") {
    throw new Error("El enlace de Maps debe comenzar con https://");
  }

  return url.toString();
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return Response.json(
      { error: "Acceso no permitido." },
      { status: 403 }
    );
  }

  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "asc" },
    });

    return Response.json(branches);
  } catch (error) {
    console.error("Error al consultar sucursales:", error);

    return Response.json(
      { error: "No se pudieron cargar las sucursales." },
      { status: 500 }
    );
  }
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
          { error: "Falta identificar la sucursal." },
          { status: 400 }
        );
      }

      const existing = await prisma.branch.findUnique({
        where: { id },
      });

      if (!existing) {
        return Response.json(
          { error: "Sucursal no encontrada." },
          { status: 404 }
        );
      }

      // Evitar eliminar una sucursal utilizada
      // por profesionales guardados actualmente en JSON.
      const clinic = await getClinicContent();

      const assignedInJson = clinic.team.some(
        (person) => person.branchIds?.includes(id)
      );

      // También revisar las relaciones futuras en Prisma.
      const assignedInPrisma =
        await prisma.professionalBranch.count({
          where: { branchId: id },
        });

      if (assignedInJson || assignedInPrisma > 0) {
        return Response.json(
          {
            error:
              "Esta sucursal tiene profesionales asignados. " +
              "Quitá primero esas asignaciones.",
          },
          { status: 409 }
        );
      }

      await prisma.branch.delete({ where: { id } });

      return Response.json({
        success: true,
        branches: await prisma.branch.findMany({
          orderBy: { createdAt: "asc" },
        }),
      });
    }

    if (action !== "save") {
      return Response.json(
        { error: "Operación no válida." },
        { status: 400 }
      );
    }

    const name = String(form.get("name") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();

    const hoursText = String(form.get("hours") ?? "");

    const hours = hoursText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const mapsText = String(form.get("mapsUrl") ?? "");
    const whatsappText = String(form.get("whatsapp") ?? "");
    const instagramText = String(form.get("instagramUrl") ?? "");

    if (!name || !address) {
      return Response.json(
        { error: "El nombre y la dirección son obligatorios." },
        { status: 400 }
      );
    }

    if (name.length > 120 || address.length > 250) {
      return Response.json(
        { error: "El nombre o la dirección son demasiado largos." },
        { status: 400 }
      );
    }

    if (hours.length > 15 || hours.some((h) => h.length > 200)) {
      return Response.json(
        { error: "Revisá los horarios ingresados." },
        { status: 400 }
      );
    }

    const whatsapp = whatsappText.replace(/\D/g, "");

    if (whatsapp && !/^\d{8,16}$/.test(whatsapp)) {
      return Response.json(
        { error: "Ingresá un número de WhatsApp válido." },
        { status: 400 }
      );
    }

    let mapsUrl: string | null;
    let instagramUrl: string | null;

    try {
      mapsUrl = normalizeMaps(mapsText);
      instagramUrl = normalizeInstagram(instagramText);
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Revisá los enlaces ingresados.",
        },
        { status: 400 }
      );
    }

    const data = {
      name,
      address,
      hours,
      mapsUrl,
      whatsapp: whatsapp || null,
      instagramUrl,
    };

    if (id) {
      const existing = await prisma.branch.findUnique({
        where: { id },
      });

      if (!existing) {
        return Response.json(
          { error: "Sucursal no encontrada." },
          { status: 404 }
        );
      }

      await prisma.branch.update({
        where: { id },
        data,
      });
    } else {
      await prisma.branch.create({ data });
    }

    return Response.json({
      success: true,
      branches: await prisma.branch.findMany({
        orderBy: { createdAt: "asc" },
      }),
    });
  } catch (error) {
    console.error("Error al guardar sucursal:", error);

    return Response.json(
      { error: "No se pudo guardar la sucursal." },
      { status: 500 }
    );
  }
}
