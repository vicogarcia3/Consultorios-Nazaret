import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.count();

  const plans = await prisma.plan.count();

  const pendingPayments = await prisma.payment.count({
    where: {
      status: "pending",
    },
  });

  const paidPayments = await prisma.payment.findMany({
    where: {
      status: "paid",
    },
  });

  const income = paidPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return Response.json({
    patients,
    plans,
    pendingPayments,
    income,
  });
}