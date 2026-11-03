
import "server-only";

import { auth } from "../auth";
import prisma from "./prisma";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "ADMIN"
  ) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      active: true,
      sessionVersion: true,
    },
  });

  return Boolean(
    user &&
    user.active &&
    user.role === "ADMIN" &&
    user.sessionVersion === session.user.sessionVersion
  );
}
