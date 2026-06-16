"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserInfo() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div
      style={{
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom:
          "1px solid rgba(255,255,255,.3)",
      }}
    >
      <p>
        👤 {session.user.name}
      </p>

      <p>
        🔒 {" "}
        {(session.user as any).role === "admin"
          ? "Administrador"
          : "Profesional"}
      </p>

      <button
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        style={{
          marginTop: 10,
          padding: "8px 12px",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}