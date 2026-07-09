import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isDowngrade, isSubscriptionLevel } from "@/lib/subscription";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const body = await req.json();
  const { targetLevel } = body;

  if (!targetLevel || !isSubscriptionLevel(targetLevel)) {
    return NextResponse.json({ error: "Ungültiger Tarif." }, { status: 400 });
  }

  const currentLevel = result.user.effectiveSubscriptionLevel;

  if (targetLevel === currentLevel) {
    return NextResponse.json({ error: "Du hast diesen Tarif bereits." }, { status: 400 });
  }

  if (!isDowngrade(currentLevel, targetLevel)) {
    return NextResponse.json(
      { error: "Nur Wechsel in einen niedrigeren Tarif sind sofort möglich." },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscriptionRequest.updateMany({
      where: { userId: result.user.id, status: "Pending" },
      data: {
        status: "Rejected",
        adminNote: "Automatisch geschlossen wegen Tarif-Downgrade.",
        reviewedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: result.user.id },
      data: { subscriptionLevel: targetLevel },
    });
  });

  return NextResponse.json({ subscriptionLevel: targetLevel });
}
