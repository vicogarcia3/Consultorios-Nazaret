
import "dotenv/config";

import { input, password } from "@inquirer/prompts";
import argon2 from "argon2";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Falta DATABASE_URL en .env");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log(
        "Ya existe una cuenta administradora. " +
        "No se creará otra desde este script."
      );
      return;
    }

    const name = (
      await input({
        message: "Nombre y apellido del administrador:",
      })
    ).trim();

    const email = (
      await input({
        message: "Correo electrónico del administrador:",
      })
    ).trim().toLowerCase();

    const secret = await password({
      message: "Creá una contraseña (mínimo 12 caracteres):",
      mask: "*",
    });

    if (!name || !email || !email.includes("@")) {
      throw new Error("Nombre o email no válido.");
    }

    if (secret.length < 12 || secret.length > 128) {
      throw new Error(
        "La contraseña debe tener entre 12 y 128 caracteres."
      );
    }

    const alreadyExists = await prisma.user.findUnique({
      where: { email },
    });

    if (alreadyExists) {
      throw new Error("Ya existe una cuenta con ese email.");
    }

    const passwordHash = await argon2.hash(secret, {
      type: argon2.argon2id,
    });

    await prisma.user.create({
      data: {
        name,
        email,
        role: "ADMIN",
        active: true,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });

    console.log("Cuenta administradora creada correctamente.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
