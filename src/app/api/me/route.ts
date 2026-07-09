import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getEffectiveSubscriptionLevel } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      subscriptionLevel: true,
      subscriptionExpiresAt: true,
      email: true,
      emailVerified: true,
      image: true,
      totpEnabled: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const effectiveSubscriptionLevel = getEffectiveSubscriptionLevel(user);

  return NextResponse.json({
    ...user,
    subscriptionLevel: effectiveSubscriptionLevel,
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? undefined,
    birthDate: user.birthDate?.toISOString() ?? undefined,
    emailVerified: user.emailVerified?.toISOString() ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });
}
