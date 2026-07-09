import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { hasClassOrganization, getEffectiveSubscriptionLevel } from "@/lib/subscription";
import {
  countWords,
  GENERATED_CERTIFICATE_MAX_AGE_MS,
  GENERATE_INPUT_LIMITS,
  getPlanLimitsForUser,
  sanitizeStringArray,
} from "@/lib/plan-limits";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true, subscriptionExpiresAt: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const className = url.searchParams.get("className");
  const effectiveLevel = getEffectiveSubscriptionLevel(dbUser);
  const { saveLimit } = getPlanLimitsForUser(dbUser);

  const where: { userId: string; className?: string | null } = { userId: dbUser.id };

  if (className === "__none__") {
    where.className = null;
  } else if (className) {
    if (!hasClassOrganization(effectiveLevel)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    where.className = className;
  }

  const certificates = await prisma.certificate.findMany({
    where,
    orderBy: [{ className: "asc" }, { name: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    certificates,
    classOrganizationEnabled: hasClassOrganization(effectiveLevel),
    saveLimit,
  });
}

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true, subscriptionExpiresAt: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const effectiveLevel = getEffectiveSubscriptionLevel(dbUser);

  const {
    text,
    grade,
    socialSkills,
    roles,
    name,
    gender,
    schoolYear,
    className,
    generatedId,
  } = body as Record<string, unknown>;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "No certificate text provided" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }
  if (!gender || typeof gender !== "string") {
    return NextResponse.json({ error: "No gender provided" }, { status: 400 });
  }
  if (!schoolYear || typeof schoolYear !== "string") {
    return NextResponse.json({ error: "No school year provided" }, { status: 400 });
  }
  if (!generatedId || typeof generatedId !== "string") {
    return NextResponse.json(
      { error: "Zeugnis muss zuerst generiert werden." },
      { status: 400 }
    );
  }

  const generated = await prisma.generatedCertificate.findUnique({
    where: { id: generatedId },
  });

  if (
    !generated ||
    generated.userId !== dbUser.id ||
    generated.consumedAt ||
    !generated.text
  ) {
    return NextResponse.json(
      { error: "Ungültige oder bereits verwendete Generierung." },
      { status: 403 }
    );
  }

  if (Date.now() - generated.createdAt.getTime() > GENERATED_CERTIFICATE_MAX_AGE_MS) {
    return NextResponse.json(
      { error: "Die Generierung ist abgelaufen. Bitte erneut generieren." },
      { status: 400 }
    );
  }

  if (text !== generated.text) {
    return NextResponse.json(
      { error: "Der Text stimmt nicht mit der Generierung überein." },
      { status: 400 }
    );
  }

  const { saveLimit } = getPlanLimitsForUser(dbUser);
  const totalSaved = await prisma.certificate.count({
    where: { userId: dbUser.id },
  });

  if (totalSaved >= saveLimit) {
    return NextResponse.json(
      { error: "Speicherlimit erreicht. Upgrade nötig." },
      { status: 403 }
    );
  }

  let normalizedClassName: string | null = null;
  if (typeof className === "string" && className.trim()) {
    if (!hasClassOrganization(effectiveLevel)) {
      return NextResponse.json(
        { error: "Klassen-Organisation ist ab Premium verfügbar." },
        { status: 403 }
      );
    }
    normalizedClassName = className.trim();
  }

  const limits = GENERATE_INPUT_LIMITS;
  const wordCount = countWords(text);
  const normalizedSkills = sanitizeStringArray(socialSkills, limits.maxSkills, limits.itemMaxLength);
  const normalizedRoles = sanitizeStringArray(roles, limits.maxRoles, limits.itemMaxLength);

  const savedCertificate = await prisma.$transaction(async (tx) => {
    const currentSaved = await tx.certificate.count({
      where: { userId: dbUser.id },
    });
    if (currentSaved >= saveLimit) {
      throw new Error("SAVE_LIMIT");
    }

    const freshGenerated = await tx.generatedCertificate.findUnique({
      where: { id: generatedId },
    });
    if (
      !freshGenerated ||
      freshGenerated.userId !== dbUser.id ||
      freshGenerated.consumedAt
    ) {
      throw new Error("INVALID_GENERATION");
    }

    const cert = await tx.certificate.create({
      data: {
        userId: dbUser.id,
        name: name.trim().slice(0, limits.nameMaxLength),
        gender: gender.trim().slice(0, limits.genderMaxLength),
        text,
        grade: typeof grade === "string" ? grade.trim().slice(0, limits.gradeMaxLength) : null,
        className: normalizedClassName,
        schoolYear: schoolYear.trim(),
        socialSkills: normalizedSkills,
        roles: normalizedRoles,
        wordCount,
      },
    });

    await tx.generatedCertificate.update({
      where: { id: generatedId },
      data: { consumedAt: new Date() },
    });

    return cert;
  }).catch((err: Error) => {
    if (err.message === "SAVE_LIMIT") return "SAVE_LIMIT" as const;
    if (err.message === "INVALID_GENERATION") return "INVALID_GENERATION" as const;
    throw err;
  });

  if (savedCertificate === "SAVE_LIMIT") {
    return NextResponse.json(
      { error: "Speicherlimit erreicht. Upgrade nötig." },
      { status: 403 }
    );
  }
  if (savedCertificate === "INVALID_GENERATION") {
    return NextResponse.json(
      { error: "Ungültige oder bereits verwendete Generierung." },
      { status: 403 }
    );
  }

  return NextResponse.json({ certificate: savedCertificate });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert || cert.userId !== dbUser.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }
  await prisma.certificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
