import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getMonthStart } from "@/lib/plan-limits";
import {
  getModelPricing,
  getUsdToEurRate,
  groupUsageByDay,
  hasOpenAiKey,
  OPENAI_MODEL,
  sumUsageTotals,
} from "@/lib/openai-usage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) return result.error;

  const monthStart = getMonthStart();
  const usageSelect = {
    id: true,
    userId: true,
    createdAt: true,
    openAiModel: true,
    openAiPromptTokens: true,
    openAiCompletionTokens: true,
    openAiTotalTokens: true,
    openAiCostUsd: true,
    user: {
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    },
  } as const;

  const [allUsageRecords, monthUsageRecords, mockGenerationsThisMonth, recentUsage] =
    await Promise.all([
      prisma.generatedCertificate.findMany({
        where: { openAiTotalTokens: { not: null } },
        select: {
          openAiPromptTokens: true,
          openAiCompletionTokens: true,
          openAiTotalTokens: true,
          openAiCostUsd: true,
        },
      }),
      prisma.generatedCertificate.findMany({
        where: {
          createdAt: { gte: monthStart },
          openAiTotalTokens: { not: null },
        },
        select: {
          createdAt: true,
          openAiPromptTokens: true,
          openAiCompletionTokens: true,
          openAiTotalTokens: true,
          openAiCostUsd: true,
        },
      }),
      prisma.generatedCertificate.count({
        where: {
          createdAt: { gte: monthStart },
          openAiTotalTokens: null,
        },
      }),
      prisma.generatedCertificate.findMany({
        where: { openAiTotalTokens: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: usageSelect,
      }),
    ]);

  const totalsAllTime = sumUsageTotals(allUsageRecords);
  const totalsThisMonth = sumUsageTotals(monthUsageRecords);
  const usdToEur = getUsdToEurRate();
  const pricing = getModelPricing(OPENAI_MODEL);

  return NextResponse.json({
    openAiConfigured: hasOpenAiKey(),
    model: OPENAI_MODEL,
    pricing,
    usdToEur,
    totals: {
      allTime: totalsAllTime,
      thisMonth: totalsThisMonth,
    },
    mockGenerationsThisMonth,
    dailyThisMonth: groupUsageByDay(monthUsageRecords),
    recent: recentUsage.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      userEmail: entry.user.email,
      userName: [entry.user.firstName, entry.user.lastName].filter(Boolean).join(" ") || null,
      model: entry.openAiModel,
      promptTokens: entry.openAiPromptTokens,
      completionTokens: entry.openAiCompletionTokens,
      totalTokens: entry.openAiTotalTokens,
      costUsd: entry.openAiCostUsd,
      createdAt: entry.createdAt.toISOString(),
    })),
  });
}
