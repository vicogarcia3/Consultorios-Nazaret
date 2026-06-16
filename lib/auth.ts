import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        const user =
          await prisma.user.findUnique({
            where: {
              email:
                credentials.email,
            },
          });

        if (!user) {
          return null;
        }

        const validPassword =
          await bcrypt.compare(
            credentials.password,
            user.password
          );

        if (!validPassword) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role =
          (user as any).role;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      (session.user as any).role =
        token.role;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};