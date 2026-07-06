import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

const planLimits: Record<string, { monthLimit: number; saveLimit: number }> = {
  Free: { monthLimit: 5, saveLimit: 1 },
  Pro: { monthLimit: 15, saveLimit: 5 },
  Premium: { monthLimit: 70, saveLimit: 50 },
  Vip: { monthLimit: Number.MAX_SAFE_INTEGER, saveLimit: Number.MAX_SAFE_INTEGER },
};

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
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
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = generated.filter((c) => new Date(c.createdAt) >= monthStart);
  const monthGenerated = thisMonth.length;
  const { monthLimit, saveLimit } = planLimits[dbUser.subscriptionLevel] ?? planLimits["Free"];
  const monthSaved = certificates.filter((c) => new Date(c.createdAt) >= monthStart).length;
  return NextResponse.json({
    monthGenerated,
    monthLimit,
    monthSaved: Math.min(monthSaved, saveLimit),
    totalGenerated,
    totalSaved: Math.min(totalSaved, saveLimit),
    totalWords,
    avgWords,
    saveLimit,
  });
}
