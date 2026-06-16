"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();

  const role = (session?.user as any)?.role;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1001,
          border: "none",
          background: "#A2B38B",
          color: "white",
          fontSize: 24,
          padding: "10px 15px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.4)",
          zIndex: 1000,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .3s ease",
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 300,
          height: "100%",
          background: "#A2B38B",
          padding: 25,
          zIndex: 1001,
          boxShadow: "0 0 25px rgba(0,0,0,.15)",
          overflowY: "auto",
          transform: open
            ? "translateX(0)"
            : "translateX(-100%)",
          transition:
            "transform .3s ease-in-out",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 24,
            cursor: "pointer",
            color: "white",
          }}
        >
          ✕
        </button>

        <h2
          style={{
            marginTop: 20,
            color: "white",
          }}
        >
          🦷 Consultorios Nazaret
        </h2>

        {session?.user && (
          <>
            <p style={{ color: "white" }}>
              👤 {session.user.name}
            </p>

            <p style={{ color: "white" }}>
              🔑{" "}
              {role === "admin"
                ? "Administrador"
                : "Profesional"}
            </p>

            <hr />
          </>
        )}

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            marginTop: 20,
          }}
        >
          {/* SECCIÓN PÚBLICA */}

          <Link
            href="/"
            onClick={() => setOpen(false)}
          >
            Inicio
          </Link>

          <Link
            href="/doctors"
            onClick={() => setOpen(false)}
          >
            Especialistas
          </Link>

          <Link
            href="/plans"
            onClick={() => setOpen(false)}
          >
            Planes
          </Link>

          {/* SECCIÓN PRIVADA */}

          {session?.user && (
            <>
              <hr />

              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/patients"
                onClick={() => setOpen(false)}
              >
                Pacientes
              </Link>

              <Link
                href="/calendar"
                onClick={() => setOpen(false)}
              >
                Agenda
              </Link>

              <Link
                href="/payments"
                onClick={() => setOpen(false)}
              >
                Pagos
              </Link>

              <Link
                href="/budgets"
                onClick={() => setOpen(false)}
              >
                Presupuestos
              </Link>

              {role === "admin" && (
                <>
                  <Link
                    href="/dashboard/plans"
                    onClick={() => setOpen(false)}
                  >
                    Administrar planes
                  </Link>

                  <Link
                    href="/dashboard/doctors"
                    onClick={() => setOpen(false)}
                  >
                    Administrar especialistas
                  </Link>

                  <Link
                    href="/users"
                    onClick={() => setOpen(false)}
                  >
                    Usuarios
                  </Link>
                </>
              )}
            </>
          )}

          <hr />

          {!session?.user ? (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
            >
              Iniciar sesión
            </Link>
          ) : (
            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
              style={{
                textAlign: "left",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
                color: "white",
              }}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}