import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

function hasOpenAiKey(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key !== "sk-dein-openai-api-key");
}

function buildMockCertificateText(
  name: string,
  gender: string,
  grade: string,
  socialSkills: string[],
  roles: string[]
): string {
  const pronoun = gender.toLowerCase().includes("weib") ? "Sie" : "Er";
  const possessive = gender.toLowerCase().includes("weib") ? "ihre" : "seine";
  const socialSummary = socialSkills.length > 0 ? socialSkills.join(", ") : "gutes Sozialverhalten";
  const rolesSummary = roles.length > 0 ? roles.join(", ") : "keine besonderen Rollen";

  return `${name} hat in der Klassenstufe ${grade} mit Engagement und Zuverlässigkeit gearbeitet. ${pronoun} zeigt ${possessive} Leistungen in einem für diese Stufe angemessenen Rahmen und arbeitet in der Regel selbstständig und sorgfältig. Im Sozialverhalten lässt sich festhalten: ${socialSummary}. In der Klasse übernimmt ${pronoun.toLowerCase()} ${roles.length > 0 ? `folgende Funktionen: ${rolesSummary}` : "bereitwillig Mitverantwortung"}. Insgesamt erfüllt ${pronoun.toLowerCase()} die Anforderungen zufriedenstellend und entwickelt sich weiterhin positiv. (Mock-Text – kein OpenAI API-Key hinterlegt)`;
}

async function generateCertificateText(
  name: string,
  gender: string,
  grade: string,
  socialSkills: string[],
  roles: string[]
): Promise<string> {
  if (!hasOpenAiKey()) {
    return buildMockCertificateText(name, gender, grade, socialSkills, roles);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
      Name: ${name}
      Geschlecht: ${gender}
      Klasse: ${grade}
      Sozialverhalten: ${JSON.stringify(socialSkills)}
      Rollen: ${JSON.stringify(roles)}
      Bitte generiere ein Zeugnis basierend auf diesen Angaben.
    `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Du bist ein Lehrer, der Schulzeugnistexte schreibt.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
  });

  return completion.choices[0].message.content ?? buildMockCertificateText(name, gender, grade, socialSkills, roles);
}

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, gender, grade, socialSkills, roles } = body;

    // Hole das User-Objekt inkl. Abo-Level
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionLevel: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Limits je nach Abo
    const planLimits: Record<string, { monthLimit: number; saveLimit: number }> = {
      Free: { monthLimit: 5, saveLimit: 1 },
      Pro: { monthLimit: 15, saveLimit: 5 },
      Premium: { monthLimit: 70, saveLimit: 50 },
      Vip: { monthLimit: Number.MAX_SAFE_INTEGER, saveLimit: Number.MAX_SAFE_INTEGER },
    };
    const { monthLimit } = planLimits[dbUser.subscriptionLevel] ?? planLimits["Free"];
    // Generierte Zeugnisse diesen Monat zählen
    const generatedCount = await prisma.generatedCertificate.count({
      where: {
        userId: dbUser.id,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });
    if (generatedCount >= monthLimit) {
      return NextResponse.json({ error: "Limit für generierte Zeugnisse erreicht. Upgrade nötig." }, { status: 403 });
    }

    const certificateText = await generateCertificateText(name, gender, grade, socialSkills, roles);

    // Wörter zählen
    const wordCount = certificateText
      .split(/\s+/)
      .filter((w) => w.trim().length > 0).length;

    // Generierung in Datenbank loggen
    try {
      await prisma.generatedCertificate.create({
        data: {
          userId: dbUser.id,
          text: certificateText,
          wordCount,
        },
      });
    } catch (e) {
      // Fehler beim Loggen ignorieren, Generierung trotzdem ausliefern
      console.error("Fehler beim Loggen der Generierung", e);
    }

    return NextResponse.json({
      text: certificateText,
      grade,
      socialSkills,
      roles,
      wordCount,
    });
  } catch (err) {
    console.error("Error generating certificate", err);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
