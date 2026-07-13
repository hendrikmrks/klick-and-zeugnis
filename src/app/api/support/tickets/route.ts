import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const user = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subject: true,
      message: true,
      status: true,
      adminReply: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { subject, message, guestName, guestEmail } = body;

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Betreff und Nachricht sind erforderlich." },
      { status: 400 }
    );
  }

  const user = await getOptionalUser();

  if (!user) {
    if (!guestName?.trim() || !guestEmail?.trim()) {
      return NextResponse.json(
        { error: "Bitte geben Sie Name und E-Mail-Adresse an." },
        { status: 400 }
      );
    }
    if (!emailPattern.test(guestEmail.trim())) {
      return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user?.id ?? null,
      guestName: user ? null : guestName.trim(),
      guestEmail: user ? null : guestEmail.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    },
  });

  return NextResponse.json({ id: ticket.id, message: "Support-Ticket wurde erstellt." });
}
