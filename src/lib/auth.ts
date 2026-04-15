import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { createFreeSubscription } from "./auth-helpers";
import type { PlanSlug } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // Vercel болон reverse proxy-д шаардлагатай
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Google provider зөвхөн credentials тохируулагдсан үед идэвхждэг
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { email: (credentials.email as string).toLowerCase() },
          });

          if (!user?.passwordHash) return null;

          const isValid = await compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        } catch (err) {
          console.error("[auth] Credentials authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = user.id;
      }

      if (user || trigger === "update") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.userId as string },
            include: { subscription: { include: { plan: true } } },
          });

          if (dbUser) {
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.role = dbUser.role;
            token.planSlug = (dbUser.subscription?.plan.slug ?? "free") as PlanSlug;
          }
        } catch (err) {
          console.error("[auth] JWT callback DB error:", err);
          // DB алдаа гарсан ч нэвтрэлтийг үргэлжлүүлнэ
          if (!token.role) token.role = "USER";
          if (!token.planSlug) token.planSlug = "free" as PlanSlug;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.userId = token.userId as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.planSlug = token.planSlug as PlanSlug;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        await createFreeSubscription(user.id);
      } catch (err) {
        console.error("[auth] createUser event error:", err);
      }
    },
  },
});
