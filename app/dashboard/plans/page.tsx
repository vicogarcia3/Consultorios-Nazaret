import { prisma } from "@/lib/prisma";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { id: "asc" },
  });

  return <PlansClient plans={plans} />;
}