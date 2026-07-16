import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  buildCertificateReportExport,
  getCertificateReportDetails,
} from "@/lib/certificate-report-details";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const report = await prisma.certificateReport.findUnique({
    where: { id },
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

  if (!report) {
    return NextResponse.json({ error: "Meldung nicht gefunden." }, { status: 404 });
  }

  const details = await getCertificateReportDetails(report);
  const exportData = buildCertificateReportExport(report, details);

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="zeugnis-meldung-${report.id}.json"`,
    },
  });
}
