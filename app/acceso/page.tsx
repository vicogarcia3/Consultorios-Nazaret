
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccesoPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/iniciar-sesion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      active: true,
      sessionVersion: true,
    },
  });

  if (
    !user ||
    !user.active ||
    user.role !== "ADMIN" ||
    user.sessionVersion !== session.user.sessionVersion
  ) {
    redirect("/iniciar-sesion");
  }

  redirect("/admin");
}
