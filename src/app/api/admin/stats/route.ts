import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const [pendingRequests, pendingReports, users] = await Promise.all([
    prisma.subscriptionRequest.count({ where: { status: "Pending" } }),
    prisma.certificateReport.count({ where: { status: "Pending" } }),
    prisma.user.count(),
  ]);

  return NextResponse.json({ pendingRequests, pendingReports, users });
}
