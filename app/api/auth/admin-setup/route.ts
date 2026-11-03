
import argon2 from "argon2";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function setupEnabled() {
  return process.env.ADMIN_SETUP_ENABLED === "true";
}

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return Response.json(
      {
        registrationAvailable:
          setupEnabled() && userCount === 0,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error al consultar administradores:", error);

    return Response.json(
      { error: "No se pudo verificar el registro." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!setupEnabled()) {
    return Response.json(
      { error: "El registro está cerrado." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    if (!password) {
      return Response.json(
        { error: "Ingresá una contraseña." },
        { status: 400 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const created = await prisma.$transaction(
      async (tx) => {
        // Evita dos registros simultáneos mediante esta API.
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(71824031)::text AS lock_result
        `;

        const userCount = await tx.user.count();

        if (userCount !== 0) {
          return false;
        }

        await tx.user.create({
          data: {
            name: email.split("@")[0],
            email,
            role: "ADMIN",
            active: true,
            passwordHash,
            emailVerifiedAt: new Date(),
            sessionVersion: 0,
          },
        });

        return true;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    if (!created) {
      return Response.json(
        {
          error:
            "Ya existe una cuenta administradora. No se pueden crear más cuentas.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar administrador:", error);

    return Response.json(
      { error: "No se pudo crear la cuenta." },
      { status: 500 }
    );
  }
}
