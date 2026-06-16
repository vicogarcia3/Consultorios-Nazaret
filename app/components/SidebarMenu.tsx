"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SidebarMenu() {
  const { data: session } = useSession();

  const role = (session?.user as any)?.role;

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 30,
      }}
    >
      <Link href="/dashboard">
        📊 Dashboard
      </Link>

      <Link href="/patients">
        👥 Pacientes
      </Link>

      <Link href="/calendar">
        📅 Agenda
      </Link>

      <Link href="/payments">
        💳 Pagos
      </Link>

      <Link href="/budgets">
        📄 Presupuestos
      </Link>

      <Link href="/doctors">
        👨‍⚕️ Especialistas
      </Link>

      {role === "admin" && (
        <>
          <Link href="/plans">
            📋 Planes
          </Link>

          <Link href="/users">
            👤 Usuarios
          </Link>
        </>
      )}
    </nav>
  );
}