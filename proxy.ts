
import { NextResponse } from "next/server";
import { auth } from "./auth";

export const proxy = auth((request) => {
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/admin");

  const session = request.auth;

  if (!session?.user?.id) {
    if (isApi) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL("/iniciar-sesion", request.url)
    );
  }

  if (session.user.role !== "ADMIN") {
    if (isApi) {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 }
      );
    }

    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
