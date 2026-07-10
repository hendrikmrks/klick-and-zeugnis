export type BillingDetails = {
  billingEmail: string;
  billingName: string;
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBillingDetails(body: unknown): { data?: BillingDetails; error?: string } {
  if (!body || typeof body !== "object") {
    return { error: "Ungültige Anfrage." };
  }

  const {
    billingEmail,
    billingName,
    billingStreet,
    billingZip,
    billingCity,
    billingCountry,
  } = body as Record<string, unknown>;

  if (typeof billingEmail !== "string" || !EMAIL_PATTERN.test(billingEmail.trim())) {
    return { error: "Bitte gib eine gültige Rechnungs-E-Mail-Adresse an." };
  }

  const fields: Array<[keyof BillingDetails, string]> = [
    ["billingName", "Rechnungsempfänger"],
    ["billingStreet", "Straße und Hausnummer"],
    ["billingZip", "Postleitzahl"],
    ["billingCity", "Ort"],
  ];

  const data: BillingDetails = {
    billingEmail: billingEmail.trim(),
    billingName: "",
    billingStreet: "",
    billingZip: "",
    billingCity: "",
    billingCountry: "Deutschland",
  };

  for (const [key, label] of fields) {
    const value = (body as Record<string, unknown>)[key];
    if (typeof value !== "string" || !value.trim()) {
      return { error: `Bitte gib ${label} an.` };
    }
    data[key] = value.trim();
  }

  if (typeof billingCountry === "string" && billingCountry.trim()) {
    data.billingCountry = billingCountry.trim();
  }

  return { data };
}

export function formatBillingAddress(details: BillingDetails): string {
  return `${details.billingName}, ${details.billingStreet}, ${details.billingZip} ${details.billingCity}, ${details.billingCountry}`;
}
