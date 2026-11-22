import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { DASHBOARD_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
};

export const getServerSession = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch (error) {
    console.error("[fixmate] Could not read server session", error);
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user as unknown as SessionUser & Record<string, unknown>;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: (user.role as Role) ?? "customer",
    phone: (user.phone as string | null) ?? null,
    area: (user.area as string | null) ?? null,
    bio: (user.bio as string | null) ?? null,
  };
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(DASHBOARD_HOME[user.role] ?? "/dashboard/customer");
  }
  return user;
}
