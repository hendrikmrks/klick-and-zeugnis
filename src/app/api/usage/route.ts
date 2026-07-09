import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getEffectiveSubscriptionLevel } from "@/lib/subscription";
import { getMonthStart, getPlanLimits } from "@/lib/plan-limits";

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

  const effectiveLevel = getEffectiveSubscriptionLevel(dbUser);
  const generated = await prisma.generatedCertificate.findMany({
    where: { userId: dbUser.id },
  });
  const certificates = await prisma.certificate.findMany({
    where: { userId: dbUser.id },
  });
  const totalGenerated = generated.length;
  const totalSaved = certificates.length;
  const totalWords = generated.reduce((sum, c) => sum + (c.wordCount || 0), 0);
  const avgWords = totalGenerated > 0 ? Math.round(totalWords / totalGenerated) : 0;
  const monthStart = getMonthStart();
  const thisMonth = generated.filter((c) => new Date(c.createdAt) >= monthStart);
  const monthGenerated = thisMonth.length;
  const { monthLimit, saveLimit } = getPlanLimits(effectiveLevel);

  return NextResponse.json({
    monthGenerated,
    monthLimit,
    totalGenerated,
    totalSaved,
    totalWords,
    avgWords,
    saveLimit,
    subscriptionLevel: effectiveLevel,
  });
}
