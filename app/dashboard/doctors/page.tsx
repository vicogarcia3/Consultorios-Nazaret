import { prisma } from "@/lib/prisma";
import DoctorsClient from "./DoctorsClient";

export default async function DoctorsAdminPage() {
  const doctors = await prisma.doctor.findMany({
    orderBy: { name: "asc" },
  });

  return <DoctorsClient doctors={doctors} isAdmin={true} />;
}