import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import {
  buildUsageRecord,
  hasOpenAiKey,
  OPENAI_MODEL,
  type OpenAiUsageRecord,
} from "@/lib/openai-usage";
import {
  countWords,
  GENERATE_INPUT_LIMITS,
  getMonthStart,
  getPlanLimitsForUser,
  sanitizeStringArray,
} from "@/lib/plan-limits";

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
): Promise<{ text: string; usage: OpenAiUsageRecord | null }> {
  if (!hasOpenAiKey()) {
    return {
      text: buildMockCertificateText(name, gender, grade, socialSkills, roles),
      usage: null,
    };
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
    model: OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: "Du bist ein Lehrer, der Schulzeugnistexte schreibt.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
  });

  const text =
    completion.choices[0].message.content ??
    buildMockCertificateText(name, gender, grade, socialSkills, roles);

  const usage = completion.usage
    ? buildUsageRecord(
        completion.model ?? OPENAI_MODEL,
        completion.usage.prompt_tokens,
        completion.usage.completion_tokens
      )
    : null;

  return { text, usage };
}

function parseGenerateInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "Ungültige Anfrage." };
  }

  const { name, gender, grade, socialSkills, roles } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Name ist erforderlich." };
  }
  if (typeof gender !== "string" || !gender.trim()) {
    return { error: "Geschlecht ist erforderlich." };
  }
  if (typeof grade !== "string" || !grade.trim()) {
    return { error: "Klasse ist erforderlich." };
  }

  const limits = GENERATE_INPUT_LIMITS;
  return {
    data: {
      name: name.trim().slice(0, limits.nameMaxLength),
      gender: gender.trim().slice(0, limits.genderMaxLength),
      grade: grade.trim().slice(0, limits.gradeMaxLength),
      socialSkills: sanitizeStringArray(socialSkills, limits.maxSkills, limits.itemMaxLength),
      roles: sanitizeStringArray(roles, limits.maxRoles, limits.itemMaxLength),
    },
  };
}

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = parseGenerateInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { name, gender, grade, socialSkills, roles } = parsed.data;

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionLevel: true, subscriptionExpiresAt: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { monthLimit } = getPlanLimitsForUser(dbUser);
    const monthStart = getMonthStart();

    const reservation = await prisma.$transaction(async (tx) => {
      const generatedCount = await tx.generatedCertificate.count({
        where: {
          userId: dbUser.id,
          createdAt: { gte: monthStart },
        },
      });

      if (generatedCount >= monthLimit) {
        return null;
      }

      return tx.generatedCertificate.create({
        data: {
          userId: dbUser.id,
          text: "",
          wordCount: 0,
        },
      });
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Limit für generierte Zeugnisse erreicht. Upgrade nötig." },
        { status: 403 }
      );
    }

    try {
      const { text: certificateText, usage } = await generateCertificateText(
        name,
        gender,
        grade,
        socialSkills,
        roles
      );
      const wordCount = countWords(certificateText);

      await prisma.generatedCertificate.update({
        where: { id: reservation.id },
        data: {
          text: certificateText,
          wordCount,
          openAiModel: usage?.model ?? null,
          openAiPromptTokens: usage?.promptTokens ?? null,
          openAiCompletionTokens: usage?.completionTokens ?? null,
          openAiTotalTokens: usage?.totalTokens ?? null,
          openAiCostUsd: usage?.estimatedCostUsd ?? null,
        },
      });

      return NextResponse.json({
        generatedId: reservation.id,
        text: certificateText,
        grade,
        socialSkills,
        roles,
        wordCount,
      });
    } catch (err) {
      await prisma.generatedCertificate.delete({ where: { id: reservation.id } }).catch(() => undefined);
      throw err;
    }
  } catch (err) {
    console.error("Error generating certificate", err);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
