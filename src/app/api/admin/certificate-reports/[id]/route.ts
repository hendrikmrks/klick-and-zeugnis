import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const body = await req.json();
  const { adminFeedback } = body;

  const report = await prisma.certificateReport.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Meldung nicht gefunden." }, { status: 404 });
  }

  if (!adminFeedback || typeof adminFeedback !== "string" || !adminFeedback.trim()) {
    return NextResponse.json({ error: "Feedback ist erforderlich." }, { status: 400 });
  }

  const updated = await prisma.certificateReport.update({
    where: { id },
    data: {
      adminFeedback: adminFeedback.trim(),
      status: "Reviewed",
      reviewedById: result.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ report: updated });
}
