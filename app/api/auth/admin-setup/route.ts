
import { createHash, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";

import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function setupEnabled() {
  return Boolean(
    process.env.ADMIN_SETUP_KEY &&
    process.env.ADMIN_SETUP_KEY.length >= 32
  );
}

function validActivationKey(value: string) {
  const secret = process.env.ADMIN_SETUP_KEY;

  if (!secret || secret.length < 32) {
    return false;
  }

  const expected = createHash("sha256")
    .update(secret)
    .digest();

  const received = createHash("sha256")
    .update(value)
    .digest();

  return timingSafeEqual(expected, received);
}

// Consultar si está disponible el registro inicial.
export async function GET() {
  try {
    const users = await prisma.user.count();

    return Response.json(
      {
        registrationAvailable:
          users === 0 && setupEnabled(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error al verificar la configuración inicial:",
      error
    );

    return Response.json(
      { error: "No se pudo verificar el registro." },
      { status: 500 }
    );
  }
}

// Crear la primera y única cuenta administradora.
export async function POST(request: Request) {
  if (!setupEnabled()) {
    return Response.json(
      { error: "El registro administrativo está cerrado." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return Response.json(
        { error: "Datos inválidos." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const activationKey =
      typeof body.activationKey === "string"
        ? body.activationKey
        : "";

    if (
      !name ||
      name.length > 120 ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        { error: "Ingresá un nombre y correo válidos." },
        { status: 400 }
      );
    }

    if (password.length < 12 || password.length > 128) {
      return Response.json(
        {
          error:
            "La contraseña debe tener entre 12 y 128 caracteres.",
        },
        { status: 400 }
      );
    }

    if (!validActivationKey(activationKey)) {
      return Response.json(
        { error: "Clave de activación incorrecta." },
        { status: 403 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const created = await prisma.$transaction(
      async (tx) => {
        // Evita que dos solicitudes simultáneas
        // puedan crear dos administradores.
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(71824031)
        `;

        // Bloqueamos el registro si ya existe
        // cualquier cuenta, activa o inactiva.
        const userCount = await tx.user.count();

        if (userCount > 0) {
          return false;
        }

        await tx.user.create({
          data: {
            name,
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
            "Ya existe una cuenta administradora. El registro está cerrado.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error al crear el administrador:",
      error
    );

    return Response.json(
      { error: "No se pudo crear la cuenta administradora." },
      { status: 500 }
    );
  }
}
