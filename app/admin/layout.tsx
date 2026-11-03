
import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { isAdmin } from "../../lib/admin-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/iniciar-sesion");
  }

  if (!(await isAdmin())) {
    redirect("/");
  }

  return <>{children}</>;
}
