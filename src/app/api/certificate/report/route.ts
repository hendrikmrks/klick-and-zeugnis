import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const reports = await prisma.certificateReport.findMany({
    where: { userId: result.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      studentName: true,
      text: true,
      reason: true,
      status: true,
      adminFeedback: true,
      reviewedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const body = await req.json();
  const { text, reason, certificateId, studentName } = body;

  if (!text || typeof text !== "string" || text.trim().length < 20) {
    return NextResponse.json({ error: "Zeugnistext ist zu kurz oder fehlt." }, { status: 400 });
  }

  if (certificateId) {
    const cert = await prisma.certificate.findFirst({
      where: { id: certificateId, userId: result.user.id },
    });
    if (!cert) {
      return NextResponse.json({ error: "Zeugnis nicht gefunden." }, { status: 404 });
    }
  }

  const report = await prisma.certificateReport.create({
    data: {
      userId: result.user.id,
      certificateId: typeof certificateId === "string" ? certificateId : null,
      studentName: typeof studentName === "string" ? studentName.trim() || null : null,
      text: text.trim(),
      reason: typeof reason === "string" ? reason.trim() || null : null,
    },
  });

  return NextResponse.json({ report });
}
