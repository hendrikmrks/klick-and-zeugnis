export type CertificatePdfMeta = {
  studentName: string;
  text: string;
  grade?: string | null;
  schoolYear?: string | null;
  className?: string | null;
  gender?: string | null;
  createdAt?: string;
};

function sanitizeFilenamePart(value: string): string {
  return (
    value
      .trim()
      .replace(/[^\wäöüÄÖÜß\- ]+/gi, "")
      .replace(/\s+/g, "_")
      .slice(0, 60) || "Zeugnis"
  );
}

function formatExportDate(isoDate?: string): string {
  if (!isoDate) {
    return new Date().toLocaleDateString("de-DE");
  }
  return new Date(isoDate).toLocaleDateString("de-DE");
}

export async function downloadCertificatePdf(meta: CertificatePdfMeta): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addLine = (text: string, options?: { bold?: boolean; size?: number; gap?: number }) => {
    const size = options?.size ?? 11;
    const gap = options?.gap ?? 6;
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    doc.setFontSize(size);

    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y + gap > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += gap;
    }
  };

  addLine("Klick & Zeugnis", { bold: true, size: 10, gap: 5 });
  addLine(`Zeugnistext – ${meta.studentName}`, { bold: true, size: 16, gap: 8 });

  const metaParts = [
    meta.className ? `Klasse ${meta.className}` : null,
    meta.grade ? `Stufe ${meta.grade}` : null,
    meta.schoolYear ? `Schuljahr ${meta.schoolYear}` : null,
    meta.gender ? meta.gender : null,
    `Erstellt am ${formatExportDate(meta.createdAt)}`,
  ].filter(Boolean);

  if (metaParts.length > 0) {
    addLine(metaParts.join(" · "), { size: 10, gap: 8 });
  }

  addLine(meta.text, { size: 11, gap: 6 });

  y += 4;
  addLine(
    "Hinweis: Dieser Text wurde KI-gestützt erstellt und sollte vor Verwendung im Zeugnis geprüft werden.",
    { size: 8, gap: 5 }
  );

  const datePart = formatExportDate(meta.createdAt).replace(/\./g, "-");
  const filename = `Zeugnis_${sanitizeFilenamePart(meta.studentName)}_${datePart}.pdf`;
  doc.save(filename);
}
