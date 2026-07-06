"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSchoolYearOptions } from "@/lib/schoolYear";

type CertificateDetailsSectionProps = {
  name: string;
  setName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  grade: string;
  setGrade: (value: string) => void;
  schoolYear: string;
  setSchoolYear: (value: string) => void;
};

const schoolYearOptions = getSchoolYearOptions();

export default function CertificateDetailsSection({
  name, setName, gender, setGender, grade, setGrade, schoolYear, setSchoolYear,
}: CertificateDetailsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Persönliche Angaben
      </h3>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Geschlecht</Label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
          <option value="divers">Divers</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Klassenstufe</Label>
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="z.B. 3" />
        </div>
        <div className="space-y-2">
          <Label>Schuljahr</Label>
          <select
            value={schoolYear}
            onChange={(e) => setSchoolYear(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {schoolYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
