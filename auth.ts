
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import type { UserRole } from "./app/generated/prisma/client";
import prisma from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  pages: {
    signIn: "/iniciar-sesion",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        const email = String(
          credentials?.email ?? ""
        ).trim().toLowerCase();

        const password = String(
          credentials?.password ?? ""
        );

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (
          !user ||
          !user.passwordHash ||
          !user.emailVerifiedAt
        ) {
          return null;
        }

        const validPassword = await argon2.verify(
          user.passwordHash,
          password
        );

        if (!validPassword) {
          return null;
        }

        // Solamente puede ingresar la administradora.
        if (!user.active || user.role !== "ADMIN") {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.sessionVersion = user.sessionVersion;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role =
          token.role as UserRole | undefined;

        session.user.sessionVersion =
          typeof token.sessionVersion === "number"
            ? token.sessionVersion
            : undefined;
      }

      return session;
    },
  },
});
