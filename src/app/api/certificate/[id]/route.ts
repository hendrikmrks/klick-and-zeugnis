import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { hasClassOrganization, getEffectiveSubscriptionLevel } from "@/lib/subscription";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true, subscriptionExpiresAt: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasClassOrganization(getEffectiveSubscriptionLevel(dbUser))) {
    return NextResponse.json(
      { error: "Klassen-Organisation ist ab Premium verfügbar." },
      { status: 403 }
    );
  }

  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert || cert.userId !== dbUser.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { className } = body;

  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      className:
        typeof className === "string" && className.trim() ? className.trim() : null,
    },
  });

  return NextResponse.json({ certificate: updated });
}
