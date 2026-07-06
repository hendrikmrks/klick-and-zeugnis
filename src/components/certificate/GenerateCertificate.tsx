"use client";

import SocialSkillsSection from "./SocialSkillsSection";
import RolesSection from "./RolesSection";
import CertificateDetailsSection from "./CertificateDetailsSection";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type GenerateCertificateProps = {
  handleSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  grade: string;
  setGrade: (value: string) => void;
  schoolYear: string;
  setSchoolYear: (value: string) => void;
  roles: Record<string, boolean>;
  setRoles: (roles: Record<string, boolean>) => void;
  socialSkills: Record<string, number>;
  setSocialSkills: (skills: Record<string, number>) => void;
  loading: boolean;
};

export default function GenerateCertificate(props: GenerateCertificateProps) {
  return (
    <form onSubmit={props.handleSubmit} className="flex flex-col gap-6">
      <CertificateDetailsSection
        name={props.name}
        setName={props.setName}
        gender={props.gender}
        setGender={props.setGender}
        grade={props.grade}
        setGrade={props.setGrade}
        schoolYear={props.schoolYear}
        setSchoolYear={props.setSchoolYear}
      />
      <SocialSkillsSection
        socialSkills={props.socialSkills}
        setSocialSkills={props.setSocialSkills}
      />
      <RolesSection roles={props.roles} setRoles={props.setRoles} />
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={props.loading}
      >
        {props.loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generiere…
          </span>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Zeugnis generieren
          </>
        )}
      </Button>
    </form>
  );
}
