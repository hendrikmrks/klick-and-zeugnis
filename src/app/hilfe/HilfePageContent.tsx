"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Alert from "@/components/layout/Alert";
import LoadingState from "@/components/layout/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
} from "lucide-react";

type Section = "faq" | "contact" | "ticket";

type FaqItem = { id: string; question: string; answer: string };

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
};

const sections: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Kontakt", icon: Mail },
  { id: "ticket", label: "Support-Ticket", icon: LifeBuoy },
];

function ticketStatusLabel(status: string) {
  if (status === "Open") return "Offen";
  if (status === "InProgress") return "In Bearbeitung";
  if (status === "Closed") return "Geschlossen";
  return status;
}

export default function HilfePageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isBlocked = searchParams.get("blocked") === "1";

  const [section, setSection] = useState<Section>(isBlocked ? "ticket" : "faq");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const [contactMessage, setContactMessage] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const loadFaq = useCallback(async () => {
    setFaqLoading(true);
    try {
      const res = await fetch("/api/faq");
      if (res.ok) {
        const data = await res.json();
        setFaqItems(data.items);
      }
    } finally {
      setFaqLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    if (!session) return;
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      if (res.ok) {
        const data = await res.json();
        setMyTickets(data.tickets);
      }
    } finally {
      setTicketsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadFaq();
  }, [loadFaq]);

  useEffect(() => {
    if (section === "ticket" && session) {
      loadTickets();
    }
  }, [section, session, loadTickets]);

  useEffect(() => {
    if (isBlocked) setSection("ticket");
  }, [isBlocked]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);
    setContactSuccess(false);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: contactMessage,
        guestName: session ? undefined : contactName,
        guestEmail: session ? undefined : contactEmail,
      }),
    });

    const data = await res.json();
    setContactLoading(false);

    if (!res.ok) {
      setContactError(data.error ?? "Senden fehlgeschlagen.");
      return;
    }

    setContactSuccess(true);
    setContactMessage("");
    if (!session) {
      setContactName("");
      setContactEmail("");
    }
  };

  const handleTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketLoading(true);
    setTicketError(null);
    setTicketSuccess(false);

    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: ticketSubject,
        message: ticketMessage,
        guestName: session ? undefined : ticketName,
        guestEmail: session ? undefined : ticketEmail,
      }),
    });

    const data = await res.json();
    setTicketLoading(false);

    if (!res.ok) {
      setTicketError(data.error ?? "Ticket konnte nicht erstellt werden.");
      return;
    }

    setTicketSuccess(true);
    setTicketSubject("");
    setTicketMessage("");
    if (!session) {
      setTicketName("");
      setTicketEmail("");
    } else {
      loadTickets();
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Kontakt & Hilfe"
        description="Häufige Fragen, Kontaktformular und Support-Tickets – wir helfen Ihnen gerne weiter."
      />

      {isBlocked && (
        <Alert variant="warning" title="Konto gesperrt">
          Ihr Konto wurde gesperrt. Bitte eröffnen Sie ein Support-Ticket, damit wir Ihren Fall prüfen
          können. Eine Entsperrung erfolgt nach manueller Prüfung durch den Support.
        </Alert>
      )}

      {!session && (
        <Alert variant="info">
          Sie sind nicht angemeldet.{" "}
          <Link href="/?auth=login" className="font-medium underline">
            Anmelden
          </Link>{" "}
          oder als Gast Name und E-Mail beim Kontaktformular bzw. Support-Ticket angeben.
        </Alert>
      )}

      <div
        className="mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
        role="tablist"
        aria-label="Hilfe-Bereiche"
      >
        {sections.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            size="sm"
            variant={section === id ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              section !== id && "text-slate-600 hover:bg-white/80 hover:text-slate-900"
            )}
            onClick={() => setSection(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {section === "faq" && (
        <div className="space-y-3">
          {faqLoading ? (
            <LoadingState label="FAQ wird geladen…" />
          ) : faqItems.length === 0 ? (
            <p className="text-slate-500">Aktuell sind keine FAQ-Einträge verfügbar.</p>
          ) : (
            faqItems.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                    onClick={() => setOpenFaq(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-slate-900">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {section === "contact" && (
        <form
          onSubmit={handleContact}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Kontaktformular</h2>
          </div>

          {contactSuccess && (
            <Alert variant="success" className="mb-4">
              Ihre Nachricht wurde gesendet. Wir melden uns bei Ihnen.
            </Alert>
          )}
          {contactError && (
            <Alert variant="error" className="mb-4">
              {contactError}
            </Alert>
          )}

          {session ? (
            <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              Angemeldet als <strong>{session.user?.name ?? session.user?.email}</strong> (
              {session.user?.email}). Ihre Nutzerdaten werden mit der Nachricht mitgesendet.
            </p>
          ) : (
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">E-Mail</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="contact-message">Nachricht</Label>
            <textarea
              id="contact-message"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm"
              placeholder="Wie können wir Ihnen helfen?"
            />
          </div>

          <Button type="submit" className="mt-4" disabled={contactLoading}>
            {contactLoading ? "Wird gesendet…" : "Nachricht senden"}
          </Button>
        </form>
      )}

      {section === "ticket" && (
        <div className="space-y-6">
          <form
            onSubmit={handleTicket}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Support-Ticket eröffnen</h2>
            </div>

            {ticketSuccess && (
              <Alert variant="success" className="mb-4">
                Ihr Support-Ticket wurde erstellt. Sie erhalten eine Antwort im Ticket-Verlauf.
              </Alert>
            )}
            {ticketError && (
              <Alert variant="error" className="mb-4">
                {ticketError}
              </Alert>
            )}

            {session ? (
              <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                Angemeldet als <strong>{session.user?.name ?? session.user?.email}</strong> (
                {session.user?.email}).
              </p>
            ) : (
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ticket-name">Name</Label>
                  <Input
                    id="ticket-name"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ticket-email">E-Mail</Label>
                  <Input
                    id="ticket-email"
                    type="email"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-subject">Betreff</Label>
                <Input
                  id="ticket-subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="mt-1"
                  placeholder={isBlocked ? "Antrag auf Entsperrung" : "Kurze Beschreibung des Anliegens"}
                />
              </div>
              <div>
                <Label htmlFor="ticket-message">Beschreibung</Label>
                <textarea
                  id="ticket-message"
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm"
                  placeholder="Bitte beschreiben Sie Ihr Anliegen möglichst genau …"
                />
              </div>
            </div>

            <Button type="submit" className="mt-4" disabled={ticketLoading}>
              {ticketLoading ? "Wird erstellt…" : "Ticket eröffnen"}
            </Button>
          </form>

          {session && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Meine Tickets</h3>
              {ticketsLoading ? (
                <LoadingState label="Tickets werden geladen…" />
              ) : myTickets.length === 0 ? (
                <p className="text-slate-500">Sie haben noch keine Support-Tickets.</p>
              ) : (
                <div className="space-y-4">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium text-slate-900">{ticket.subject}</p>
                        <Badge className="bg-white">{ticketStatusLabel(ticket.status)}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{ticket.message}</p>
                      {ticket.adminReply && (
                        <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                          <span className="font-medium">Antwort vom Support:</span> {ticket.adminReply}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(ticket.createdAt).toLocaleString("de-DE")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
