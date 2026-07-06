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
  const { subscriptionLevel } = body;

  if (!subscriptionLevel || !isSubscriptionLevel(subscriptionLevel)) {
    return NextResponse.json({ error: "Ungültiger Tarif." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
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
    },
  });

  return NextResponse.json({ user: updated });
}
