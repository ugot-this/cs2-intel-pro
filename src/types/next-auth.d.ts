import type { PlanSlug } from "@/types";

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "USER" | "ADMIN";
    planSlug?: PlanSlug;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      email: string;
      name: string | null;
      image: string | null;
      role: "USER" | "ADMIN";
      planSlug: PlanSlug;
    };
  }
}
