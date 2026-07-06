import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      subscriptionLevel: true,
      role: true,
      createdAt: true,
      _count: { select: { certificates: true } },
    },
  });

  return NextResponse.json({ users });
}
