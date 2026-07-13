import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const body = await req.json();
  const { question, answer, sortOrder, published } = body;

  const existing = await prisma.faqItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "FAQ-Eintrag nicht gefunden." }, { status: 404 });
  }

  const item = await prisma.faqItem.update({
    where: { id },
    data: {
      ...(question !== undefined && { question: String(question).trim() }),
      ...(answer !== undefined && { answer: String(answer).trim() }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      ...(published !== undefined && { published: Boolean(published) }),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;

  const existing = await prisma.faqItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "FAQ-Eintrag nicht gefunden." }, { status: 404 });
  }

  await prisma.faqItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
