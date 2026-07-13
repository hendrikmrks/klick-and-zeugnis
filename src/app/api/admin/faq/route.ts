import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const body = await req.json();
  const { question, answer, sortOrder, published } = body;

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Frage und Antwort sind erforderlich." }, { status: 400 });
  }

  const item = await prisma.faqItem.create({
    data: {
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      published: published !== false,
    },
  });

  return NextResponse.json({ item });
}
