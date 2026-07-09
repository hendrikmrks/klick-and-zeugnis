import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { hasClassOrganization, getEffectiveSubscriptionLevel } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true, subscriptionExpiresAt: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasClassOrganization(getEffectiveSubscriptionLevel(dbUser))) {
    return NextResponse.json({ classes: [], enabled: false });
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: dbUser.id, className: { not: null } },
    select: { className: true },
  });

  const classes = [...new Set(
    certificates.map((c) => c.className).filter((c): c is string => Boolean(c))
  )].sort((a, b) => a.localeCompare(b, "de"));

  return NextResponse.json({ classes, enabled: true });
}
