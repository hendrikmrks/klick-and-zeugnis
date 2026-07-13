import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectiveSubscriptionLevel } from "@/lib/subscription";
import { NextResponse } from "next/server";
import type { SubscriptionLevel, User } from "@prisma/client";

export type AuthenticatedUser = User & {
  effectiveSubscriptionLevel: SubscriptionLevel;
};

export async function getOptionalUser() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function requireUser() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (user.isBlocked) {
    return {
      error: NextResponse.json(
        {
          error: "Ihr Konto wurde gesperrt. Bitte wenden Sie sich über die Hilfe-Seite an den Support.",
          code: "ACCOUNT_BLOCKED",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user: {
      ...user,
      effectiveSubscriptionLevel: getEffectiveSubscriptionLevel(user),
    } satisfies AuthenticatedUser,
  };
}

export async function requireAdmin() {
  const result = await requireUser();
  if ("error" in result) return result;

  if (result.user.role !== "Admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user: result.user as AuthenticatedUser };
}
