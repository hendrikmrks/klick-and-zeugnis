import { prisma } from "@/lib/prisma";
import type { Certificate, CertificateReport, GeneratedCertificate, User } from "@prisma/client";

export type ReportUserInput = {
  name: string | null;
  gender: string | null;
  grade: string | null;
  socialSkills: string[];
  roles: string[];
  style: string | null;
};

export type ReportPrompts = {
  system: string | null;
  user: string | null;
};

export type ReportGenerationMeta = {
  generatedCertificateId: string | null;
  generatedAt: string | null;
  clientIp: string | null;
  openAiModel: string | null;
  openAiPromptTokens: number | null;
  openAiCompletionTokens: number | null;
  openAiTotalTokens: number | null;
  openAiCostUsd: number | null;
  generatedText: string | null;
  wordCount: number | null;
};

export type CertificateReportDetails = {
  userInput: ReportUserInput | null;
  prompts: ReportPrompts | null;
  generation: ReportGenerationMeta | null;
  savedCertificate: {
    id: string;
    createdAt: string;
    schoolYear: string | null;
    className: string | null;
    isPrivacyProtected: boolean;
  } | null;
};

type ReportWithUser = CertificateReport & {
  user: Pick<User, "id" | "email" | "firstName" | "lastName">;
};

function userInputFromGenerated(generated: GeneratedCertificate): ReportUserInput {
  return {
    name: generated.inputName,
    gender: generated.inputGender,
    grade: generated.inputGrade,
    socialSkills: generated.inputSocialSkills,
    roles: generated.inputRoles,
    style: generated.inputStyle,
  };
}

function promptsFromGenerated(generated: GeneratedCertificate): ReportPrompts {
  return {
    system: generated.systemPrompt,
    user: generated.userPrompt,
  };
}

function generationFromGenerated(generated: GeneratedCertificate): ReportGenerationMeta {
  return {
    generatedCertificateId: generated.id,
    generatedAt: generated.createdAt.toISOString(),
    clientIp: generated.clientIp,
    openAiModel: generated.openAiModel,
    openAiPromptTokens: generated.openAiPromptTokens,
    openAiCompletionTokens: generated.openAiCompletionTokens,
    openAiTotalTokens: generated.openAiTotalTokens,
    openAiCostUsd: generated.openAiCostUsd,
    generatedText: generated.text,
    wordCount: generated.wordCount,
  };
}

function userInputFromCertificate(cert: Certificate): ReportUserInput {
  return {
    name: cert.name,
    gender: cert.gender,
    grade: cert.grade,
    socialSkills: cert.socialSkills,
    roles: cert.roles,
    style: null,
  };
}

async function resolveGeneratedCertificateId(
  report: CertificateReport,
  certificate: Certificate | null
): Promise<string | null> {
  if (report.generatedCertificateId) return report.generatedCertificateId;
  if (certificate?.generatedCertificateId) return certificate.generatedCertificateId;
  return null;
}

export async function getCertificateReportDetails(
  report: CertificateReport
): Promise<CertificateReportDetails> {
  const certificate = report.certificateId
    ? await prisma.certificate.findUnique({ where: { id: report.certificateId } })
    : null;

  const generatedId = await resolveGeneratedCertificateId(report, certificate);
  const generated = generatedId
    ? await prisma.generatedCertificate.findUnique({ where: { id: generatedId } })
    : null;

  const savedCertificate = certificate
    ? {
        id: certificate.id,
        createdAt: certificate.createdAt.toISOString(),
        schoolYear: certificate.schoolYear,
        className: certificate.className,
        isPrivacyProtected: certificate.isPrivacyProtected,
      }
    : null;

  if (generated) {
    return {
      userInput: userInputFromGenerated(generated),
      prompts: promptsFromGenerated(generated),
      generation: generationFromGenerated(generated),
      savedCertificate,
    };
  }

  if (certificate) {
    return {
      userInput: userInputFromCertificate(certificate),
      prompts: null,
      generation: {
        generatedCertificateId: null,
        generatedAt: certificate.createdAt.toISOString(),
        clientIp: null,
        openAiModel: null,
        openAiPromptTokens: null,
        openAiCompletionTokens: null,
        openAiTotalTokens: null,
        openAiCostUsd: null,
        generatedText: certificate.text,
        wordCount: certificate.wordCount,
      },
      savedCertificate,
    };
  }

  return {
    userInput: null,
    prompts: null,
    generation: null,
    savedCertificate: null,
  };
}

export function buildCertificateReportExport(
  report: ReportWithUser,
  details: CertificateReportDetails
) {
  return {
    report: {
      id: report.id,
      status: report.status,
      reason: report.reason,
      reportedText: report.text,
      studentName: report.studentName,
      adminFeedback: report.adminFeedback,
      reviewedAt: report.reviewedAt?.toISOString() ?? null,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      certificateId: report.certificateId,
      generatedCertificateId: report.generatedCertificateId,
    },
    reporter: {
      id: report.user.id,
      email: report.user.email,
      firstName: report.user.firstName,
      lastName: report.user.lastName,
    },
    details,
    exportedAt: new Date().toISOString(),
  };
}
