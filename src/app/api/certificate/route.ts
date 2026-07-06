import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { hasClassOrganization } from "@/lib/subscription";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const className = url.searchParams.get("className");

  const where: { userId: string; className?: string | null } = { userId: dbUser.id };

  if (className === "__none__") {
    where.className = null;
  } else if (className) {
    if (!hasClassOrganization(dbUser.subscriptionLevel)) {
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
    classOrganizationEnabled: hasClassOrganization(dbUser.subscriptionLevel),
  });
}

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionLevel: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { text, grade, socialSkills, roles, name, gender, schoolYear, className } = body;

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

  let normalizedClassName: string | null = null;
  if (typeof className === "string" && className.trim()) {
    if (!hasClassOrganization(dbUser.subscriptionLevel)) {
      return NextResponse.json(
        { error: "Klassen-Organisation ist ab Premium verfügbar." },
        { status: 403 }
      );
    }
    normalizedClassName = className.trim();
  }

  const wordCount = text.split(/\s+/).filter((w) => w.trim().length > 0).length;

  const savedCertificate = await prisma.certificate.create({
    data: {
      userId: dbUser.id,
      name,
      gender,
      text,
      grade,
      className: normalizedClassName,
      schoolYear,
      socialSkills,
      roles,
      wordCount,
    },
  });

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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert || cert.userId !== dbUser.id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
  }
  await prisma.certificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
