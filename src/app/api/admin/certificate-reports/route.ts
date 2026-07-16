import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getCertificateReportDetails } from "@/lib/certificate-report-details";

export async function GET(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const reports = await prisma.certificateReport.findMany({
    where: status === "Pending" || status === "Reviewed" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const reportsWithDetails = await Promise.all(
    reports.map(async (report) => ({
      ...report,
      details: await getCertificateReportDetails(report),
    }))
  );

  return NextResponse.json({ reports: reportsWithDetails });
}
