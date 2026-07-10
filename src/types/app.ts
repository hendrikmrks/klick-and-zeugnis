export type CertificateRecord = {
  id: string;
  userId: string;
  name: string;
  gender: string;
  text: string;
  grade: string | null;
  className: string | null;
  schoolYear: string | null;
  socialSkills: string[];
  roles: string[];
  wordCount: number;
  isPrivacyProtected?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PrivacyAdvancedStatus = {
  enabled: boolean;
  keyLoaded: boolean;
  keyExpiresAt: number | null;
  mappingCount: number;
};

export type UsageData = {
  monthGenerated: number;
  monthLimit: number;
  totalGenerated: number;
  totalSaved: number;
  totalWords: number;
  avgWords: number;
  saveLimit: number;
  subscriptionLevel?: string;
};
