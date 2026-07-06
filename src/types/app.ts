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
  createdAt: string;
  updatedAt: string;
};

export type UsageData = {
  monthGenerated: number;
  monthLimit: number;
  monthSaved: number;
  totalGenerated: number;
  totalSaved: number;
  totalWords: number;
  avgWords: number;
  saveLimit: number;
};
