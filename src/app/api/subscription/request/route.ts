import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { parseBillingDetails } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { isSubscriptionLevel, isUpgrade } from "@/lib/subscription";

export async function GET() {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const requests = await prisma.subscriptionRequest.findMany({
    where: { userId: result.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const body = await req.json();
  const { requestedLevel, message } = body;

  if (!requestedLevel || !isSubscriptionLevel(requestedLevel)) {
    return NextResponse.json({ error: "Ungültiger Tarif." }, { status: 400 });
  }

  const billingResult = parseBillingDetails(body);
  if (billingResult.error || !billingResult.data) {
    return NextResponse.json(
      { error: billingResult.error ?? "Rechnungsdaten sind erforderlich." },
      { status: 400 }
    );
  }

  const billing = billingResult.data;

  const currentLevel = result.user.effectiveSubscriptionLevel;

  if (requestedLevel === currentLevel) {
    return NextResponse.json({ error: "Du hast diesen Tarif bereits." }, { status: 400 });
  }

  if (!isUpgrade(currentLevel, requestedLevel)) {
    return NextResponse.json(
      { error: "Für einen niedrigeren Tarif kannst du direkt wechseln." },
      { status: 400 }
    );
  }

  const pending = await prisma.subscriptionRequest.findFirst({
    where: { userId: result.user.id, status: "Pending" },
  });

  if (pending) {
    return NextResponse.json(
      { error: "Du hast bereits eine offene Anfrage. Bitte warte auf die Bearbeitung." },
      { status: 400 }
    );
  }

  const request = await prisma.subscriptionRequest.create({
    data: {
      userId: result.user.id,
      requestedLevel,
      billingEmail: billing.billingEmail,
      billingName: billing.billingName,
      billingStreet: billing.billingStreet,
      billingZip: billing.billingZip,
      billingCity: billing.billingCity,
      billingCountry: billing.billingCountry,
      message: typeof message === "string" ? message.trim() || null : null,
    },
  });

  return NextResponse.json({ request });
}
