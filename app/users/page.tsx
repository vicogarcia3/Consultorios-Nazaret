import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function UsersPage() {
  const session =
    await getServerSession(authOptions);

  if (
    (session?.user as any)?.role !==
    "admin"
  ) {
    return (
      <p>
        No tienes permisos para ver esta página.
      </p>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main style={{ padding: 20 }}>
      <h1>👤 Usuarios</h1>

      <Link href="/users/new">
        <button>
          ➕ Nuevo usuario
        </button>
      </Link>

      <br />
      <br />

      {users.map((user) => (
        <div
          key={user.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            background: "white",
          }}
        >
          <h3>{user.name}</h3>

          <p>{user.email}</p>

          <p>
            Rol: <strong>{user.role}</strong>
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <Link
              href={`/users/${user.id}/password`}
            >
              <button>
                🔒 Cambiar contraseña
              </button>
            </Link>
          </div>
        </div>
      ))}
    </main>
  );
}