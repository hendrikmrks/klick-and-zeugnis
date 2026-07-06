/** Aktuelles Schuljahr, z. B. "2025/2026" (Wechsel im August). */
export function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

/** Letzte n Schuljahre als Auswahloptionen. */
export function getSchoolYearOptions(count = 6): string[] {
  const [startStr] = getCurrentSchoolYear().split("/");
  const startYear = parseInt(startStr, 10);
  return Array.from({ length: count }, (_, i) => {
    const y = startYear - i;
    return `${y}/${y + 1}`;
  });
}
