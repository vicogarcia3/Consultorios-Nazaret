
import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";

import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

const SUCCESS_MESSAGE =
  "Si existe una cuenta habilitada con ese correo, recibirás un enlace para restablecer tu contraseña.";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        { error: "Solicitud inválida." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const email =
      typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        { error: "Ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    const genericResponse = () =>
      Response.json({
        success: true,
        message: SUCCESS_MESSAGE,
      });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });

    // No revelamos si el correo existe.
    if (
      !user ||
      !user.active ||
      !user.passwordHash ||
      !user.emailVerifiedAt ||
      user.role !== "ADMIN"
    ) {
      return genericResponse();
    }

    const now = new Date();

    // Como máximo una solicitud cada 2 minutos.
    const recentRequest =
      await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(now.getTime() - 2 * 60 * 1000),
          },
        },
        select: { id: true },
      });

    if (recentRequest) {
      return genericResponse();
    }

    // Como máximo 5 solicitudes por cuenta
    // durante las últimas 24 horas.
    const dailyRequests =
      await prisma.passwordResetToken.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(
              now.getTime() - 24 * 60 * 60 * 1000
            ),
          },
        },
      });

    if (dailyRequests >= 5) {
      return genericResponse();
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.APP_URL;

    if (!apiKey || !from || !appUrl) {
      console.error(
        "Falta configurar Resend o APP_URL."
      );
      return genericResponse();
    }

    const baseUrl = new URL(appUrl);

    if (
      baseUrl.protocol !== "https:" &&
      !(
        process.env.NODE_ENV !== "production" &&
        baseUrl.origin === "http://localhost:3000"
      )
    ) {
      console.error(
        "APP_URL debe usar HTTPS fuera del entorno local."
      );
      return genericResponse();
    }

    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    const resetUrl = new URL(
      "/restablecer-contrasena",
      baseUrl
    );

    resetUrl.searchParams.set("token", token);

    // Guardamos únicamente el hash del token.
    const resetRecord =
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: user.email,
      subject:
        "Restablecer contraseña - Consultorios Nazaret",
      text: `Hola ${user.name}:

Recibimos una solicitud para restablecer la contraseña de tu cuenta de Consultorios Nazaret.

Para crear una nueva contraseña, ingresá al siguiente enlace:

${resetUrl.toString()}

Este enlace es personal, se puede utilizar una sola vez y vence en 30 minutos.

Si no solicitaste este cambio, podés ignorar el correo. Tu contraseña actual seguirá funcionando.

Consultorios Nazaret`,
    });

    if (error) {
      console.error(
        "No se pudo enviar el correo de recuperación:",
        error.message
      );

      // No dejamos activo un enlace que no se envió.
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      });

      return genericResponse();
    }

    // Invalidamos enlaces anteriores pendientes.
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        id: { not: resetRecord.id },
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return genericResponse();
  } catch (error) {
    console.error(
      "Error al solicitar recuperación:",
      error
    );

    return Response.json({
      success: true,
      message: SUCCESS_MESSAGE,
    });
  }
}
