export const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4";

type ModelPricing = {
  inputPer1M: number;
  outputPer1M: number;
};

/** USD per 1M tokens — update when OpenAI pricing changes. */
const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4": { inputPer1M: 30, outputPer1M: 60 },
  "gpt-4-0613": { inputPer1M: 30, outputPer1M: 60 },
  "gpt-4-turbo": { inputPer1M: 10, outputPer1M: 30 },
  "gpt-4-turbo-preview": { inputPer1M: 10, outputPer1M: 30 },
  "gpt-4o": { inputPer1M: 2.5, outputPer1M: 10 },
  "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
  "gpt-3.5-turbo": { inputPer1M: 0.5, outputPer1M: 1.5 },
};

const DEFAULT_PRICING: ModelPricing = { inputPer1M: 30, outputPer1M: 60 };

export function hasOpenAiKey(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key !== "sk-dein-openai-api-key");
}

export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? DEFAULT_PRICING;
}

export function calculateOpenAiCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = getModelPricing(model);
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPer1M;
  return inputCost + outputCost;
}

export function getUsdToEurRate(): number {
  const raw = process.env.OPENAI_USD_TO_EUR?.trim();
  const parsed = raw ? Number.parseFloat(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.92;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(amount);
}

export type OpenAiUsageRecord = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
};

export function buildUsageRecord(
  model: string,
  promptTokens: number,
  completionTokens: number
): OpenAiUsageRecord {
  return {
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimatedCostUsd: calculateOpenAiCostUsd(model, promptTokens, completionTokens),
  };
}

export type UsageTotals = {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

export function emptyUsageTotals(): UsageTotals {
  return {
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    costUsd: 0,
  };
}

export function sumUsageTotals(
  records: Array<{
    openAiPromptTokens: number | null;
    openAiCompletionTokens: number | null;
    openAiTotalTokens: number | null;
    openAiCostUsd: number | null;
  }>
): UsageTotals {
  return records.reduce((acc, record) => {
    if (record.openAiTotalTokens == null) return acc;
    acc.requests += 1;
    acc.promptTokens += record.openAiPromptTokens ?? 0;
    acc.completionTokens += record.openAiCompletionTokens ?? 0;
    acc.totalTokens += record.openAiTotalTokens;
    acc.costUsd += record.openAiCostUsd ?? 0;
    return acc;
  }, emptyUsageTotals());
}

export function groupUsageByDay(
  records: Array<{
    createdAt: Date;
    openAiTotalTokens: number | null;
    openAiCostUsd: number | null;
  }>
): Array<{ date: string; requests: number; totalTokens: number; costUsd: number }> {
  const map = new Map<string, { requests: number; totalTokens: number; costUsd: number }>();

  for (const record of records) {
    if (record.openAiTotalTokens == null) continue;
    const date = record.createdAt.toISOString().slice(0, 10);
    const current = map.get(date) ?? { requests: 0, totalTokens: 0, costUsd: 0 };
    current.requests += 1;
    current.totalTokens += record.openAiTotalTokens;
    current.costUsd += record.openAiCostUsd ?? 0;
    map.set(date, current);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));
}
