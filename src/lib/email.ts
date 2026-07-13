export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function isEmailEnabled(): boolean {
  return process.env.EMAIL_ENABLED === "true";
}

/**
 * Versendet E-Mails über Brevo SMTP, sobald EMAIL_ENABLED=true gesetzt ist.
 * Aktuell deaktiviert – Aufrufe werden protokolliert und übersprungen.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!isEmailEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] Versand deaktiviert:", payload.subject, "→", payload.to);
    }
    return false;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !port || !user || !pass || !from) {
    console.warn("[email] SMTP nicht vollständig konfiguriert – Versand übersprungen.");
    return false;
  }

  // Brevo SMTP-Integration folgt bei Aktivierung (nodemailer o. ä.)
  console.info("[email] SMTP konfiguriert, Versand noch nicht implementiert:", payload.subject);
  return false;
}

export async function notifySupportTicketReply(
  to: string,
  subject: string,
  reply: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Antwort zu Ihrem Support-Ticket: ${subject}`,
    text: reply,
  });
}

export async function notifyContactAcknowledgement(
  to: string,
  message: string
): Promise<void> {
  await sendEmail({
    to,
    subject: "Ihre Nachricht an Klick & Zeugnis",
    text: `Vielen Dank für Ihre Nachricht. Wir melden uns bei Ihnen.\n\nIhre Nachricht:\n${message}`,
  });
}
