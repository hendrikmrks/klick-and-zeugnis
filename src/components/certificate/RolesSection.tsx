"use client";

type RolesSectionProps = {
  roles: Record<string, boolean>;
  setRoles: (roles: Record<string, boolean>) => void;
};

const roleOptions = [
  "Klassensprecher",
  "Sportwart",
  "Konfliktlotse",
  "Schülerlotse",
];

export default function RolesSection({ roles, setRoles }: RolesSectionProps) {
  const toggleRole = (role: string) => {
    setRoles({ ...roles, [role]: !roles[role] });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Rollen</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roleOptions.map((role) => (
          <label
            key={role}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50"
          >
            <input
              type="checkbox"
              checked={roles[role] || false}
              onChange={() => toggleRole(role)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700">{role}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
