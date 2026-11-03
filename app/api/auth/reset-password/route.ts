
import { createHash } from "node:crypto";
import argon2 from "argon2";

import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

const INVALID_LINK =
  "El enlace no es válido o venció. Solicitá uno nuevo.";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return Response.json(
        { error: "Solicitud inválida." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const token =
      typeof data.token === "string"
        ? data.token
        : "";

    const password =
      typeof data.password === "string"
        ? data.password
        : "";

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return Response.json(
        { error: INVALID_LINK },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return Response.json(
        {
          error:
            "La contraseña debe tener al menos 8 caracteres y no superar los 128.",
        },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            active: true,
            role: true,
            passwordHash: true,
            emailVerifiedAt: true,
          },
        },
      },
    });

    const now = new Date();

    if (
      !reset ||
      reset.usedAt ||
      reset.expiresAt <= now ||
      !reset.user.active ||
      reset.user.role !== "ADMIN" ||
      !reset.user.passwordHash ||
      !reset.user.emailVerifiedAt
    ) {
      return Response.json(
        { error: INVALID_LINK },
        { status: 400 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    // Las operaciones se confirman juntas.
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: reset.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (claimed.count !== 1) {
        throw new Error("RESET_UNAVAILABLE");
      }

      const updated = await tx.user.updateMany({
        where: {
          id: reset.userId,
          active: true,
          role: "ADMIN",
          passwordHash: { not: null },
          emailVerifiedAt: { not: null },
        },
        data: {
          passwordHash,

          // Invalidar sesiones anteriores.
          sessionVersion: {
            increment: 1,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error("RESET_UNAVAILABLE");
      }

      // Invalidar los demás enlaces pendientes.
      await tx.passwordResetToken.updateMany({
        where: {
          userId: reset.userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });
    });

    return Response.json({
      success: true,
      message:
        "Tu contraseña se actualizó correctamente.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "RESET_UNAVAILABLE"
    ) {
      return Response.json(
        { error: INVALID_LINK },
        { status: 400 }
      );
    }

    console.error(
      "Error al restablecer contraseña:",
      error
    );

    return Response.json(
      { error: "No se pudo restablecer la contraseña." },
      { status: 500 }
    );
  }
}
