import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionLevel } from "@/lib/subscription";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const body = await req.json();
  const { action, adminNote, subscriptionLevel } = body;

  const request = await prisma.subscriptionRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
  }

  if ((action === "approve" || action === "reject") && request.status !== "Pending") {
    return NextResponse.json(
      { error: "Diese Anfrage wurde bereits bearbeitet." },
      { status: 409 }
    );
  }

  if (action === "approve") {
    const updated = await prisma.$transaction(async (tx) => {
      const reqUpdated = await tx.subscriptionRequest.update({
        where: { id },
        data: {
          status: "Approved",
          adminNote: typeof adminNote === "string" ? adminNote.trim() || null : null,
          reviewedById: result.user.id,
          reviewedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: { subscriptionLevel: request.requestedLevel },
      });

      return reqUpdated;
    });

    return NextResponse.json({ request: updated });
  }

  if (action === "reject") {
    const updated = await prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: "Rejected",
        adminNote: typeof adminNote === "string" ? adminNote.trim() || null : null,
        reviewedById: result.user.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ request: updated });
  }

  if (action === "set_level" && subscriptionLevel && isSubscriptionLevel(subscriptionLevel)) {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: request.userId },
        data: { subscriptionLevel },
      });

      if (request.status === "Pending") {
        return tx.subscriptionRequest.update({
          where: { id },
          data: {
            status: "Approved",
            adminNote: typeof adminNote === "string" ? adminNote.trim() || `Tarif auf ${subscriptionLevel} gesetzt.` : `Tarif auf ${subscriptionLevel} gesetzt.`,
            reviewedById: result.user.id,
            reviewedAt: new Date(),
          },
        });
      }

      return request;
    });

    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
}
