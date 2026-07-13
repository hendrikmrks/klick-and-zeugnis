import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { notifySupportTicketReply } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

const validStatuses: TicketStatus[] = ["Open", "InProgress", "Closed"];

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const body = await req.json();
  const { status, adminReply } = body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket nicht gefunden." }, { status: 404 });
  }

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminReply !== undefined && { adminReply: adminReply?.trim() || null }),
      ...((status || adminReply) && {
        reviewedById: result.user.id,
        reviewedAt: new Date(),
      }),
    },
  });

  if (adminReply?.trim()) {
    const recipient = ticket.user?.email ?? ticket.guestEmail;
    if (recipient) {
      await notifySupportTicketReply(recipient, ticket.subject, adminReply.trim());
    }
  }

  return NextResponse.json({ ticket: updated });
}
