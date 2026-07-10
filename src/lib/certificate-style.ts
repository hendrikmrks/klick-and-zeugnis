export const CERTIFICATE_STYLES = [
  {
    id: "default",
    label: "Standard",
    hint: "Ausgewogene Formulierung",
  },
  {
    id: "shorter",
    label: "Kürzer",
    hint: "Prägnanter, kompakter Text",
  },
  {
    id: "formal",
    label: "Formeller",
    hint: "Sachlich-offizieller Ton",
  },
  {
    id: "warmer",
    label: "Wärmer",
    hint: "Wertschätzender, persönlicher Ton",
  },
] as const;

export type CertificateStyle = (typeof CERTIFICATE_STYLES)[number]["id"];

const STYLE_SET = new Set<string>(CERTIFICATE_STYLES.map((s) => s.id));

export function isCertificateStyle(value: string): value is CertificateStyle {
  return STYLE_SET.has(value);
}

export function parseCertificateStyle(value: unknown): CertificateStyle {
  if (typeof value === "string" && isCertificateStyle(value)) {
    return value;
  }
  return "default";
}

export function getStyleSystemPrompt(style: CertificateStyle): string {
  const base = "Du bist ein Lehrer, der Schulzeugnistexte schreibt.";
  const instructions: Record<CertificateStyle, string> = {
    default: "Formuliere klar, sachlich und für ein Schulzeugnis angemessen.",
    shorter:
      "Formuliere deutlich kürzer und prägnanter als üblich. Entferne Wiederholungen und bleibe bei den wichtigsten Aussagen.",
    formal:
      "Formuliere besonders sachlich, formal und distanziert – wie in einem offiziellen Zeugnis üblich.",
    warmer:
      "Formuliere wertschätzend und persönlich, bleibe aber professionell und zeugnisgerecht.",
  };
  return `${base} ${instructions[style]}`;
}

export function getStyleUserInstruction(style: CertificateStyle): string {
  const instructions: Record<CertificateStyle, string> = {
    default: "Bitte generiere ein Zeugnis basierend auf diesen Angaben.",
    shorter: "Bitte generiere eine kürzere Zeugnisformulierung basierend auf diesen Angaben.",
    formal: "Bitte generiere eine besonders formelle Zeugnisformulierung basierend auf diesen Angaben.",
    warmer: "Bitte generiere eine wertschätzende Zeugnisformulierung basierend auf diesen Angaben.",
  };
  return instructions[style];
}

export function applyMockStyleVariant(text: string, style: CertificateStyle): string {
  if (style === "default") return text;

  const mockSuffix = " (Mock-Text – kein OpenAI API-Key hinterlegt)";
  const isMock = text.endsWith(mockSuffix);
  const withoutSuffix = isMock ? text.slice(0, -mockSuffix.length) : text;

  if (style === "shorter") {
    const sentences = withoutSuffix.split(/(?<=[.!?])\s+/).filter(Boolean);
    const shortened = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.6))).join(" ");
    return isMock ? `${shortened}${mockSuffix}` : shortened;
  }

  if (style === "formal") {
    const formal = withoutSuffix.replace(
      /\bgearbeitet\b/,
      "gearbeitet und erfüllt die Anforderungen in formell angemessener Weise"
    );
    return isMock ? `${formal}${mockSuffix}` : formal;
  }

  const warmer = withoutSuffix.replace(/\bpositiv\b/, "positiv und mit großem Engagement");
  return isMock ? `${warmer}${mockSuffix}` : warmer;
}
