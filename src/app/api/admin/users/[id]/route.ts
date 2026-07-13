import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { blockUser, unblockUser } from "@/lib/blocklist";
import { prisma } from "@/lib/prisma";
import { isSubscriptionLevel } from "@/lib/subscription";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const { id } = await params;
  const body = await req.json();
  const { subscriptionLevel, action, reason } = body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
  }

  if (action === "block") {
    if (user.role === "Admin") {
      return NextResponse.json({ error: "Admins können nicht gesperrt werden." }, { status: 400 });
    }
    await blockUser(id, typeof reason === "string" ? reason : undefined);
    const updated = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isBlocked: true,
        blockedAt: true,
        blockedReason: true,
      },
    });
    return NextResponse.json({ user: updated });
  }

  if (action === "unblock") {
    await unblockUser(id);
    const updated = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isBlocked: true,
        blockedAt: true,
        blockedReason: true,
      },
    });
    return NextResponse.json({ user: updated });
  }

  if (!subscriptionLevel || !isSubscriptionLevel(subscriptionLevel)) {
    return NextResponse.json({ error: "Ungültiger Tarif oder Aktion." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { subscriptionLevel },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      subscriptionLevel: true,
      role: true,
      isBlocked: true,
    },
  });

  return NextResponse.json({ user: updated });
}
