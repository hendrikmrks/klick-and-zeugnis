"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  guestName: string | null;
  guestEmail: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export type ContactMessage = {
  id: string;
  message: string;
  guestName: string | null;
  guestEmail: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

type Props = {
  tickets: SupportTicket[];
  messages: ContactMessage[];
  onReload: () => void;
};

function ticketStatusBadge(status: string) {
  const map: Record<string, string> = {
    Open: "bg-amber-100 text-amber-800",
    InProgress: "bg-blue-100 text-blue-800",
    Closed: "bg-green-100 text-green-800",
  };
  const labels: Record<string, string> = {
    Open: "Offen",
    InProgress: "In Bearbeitung",
    Closed: "Geschlossen",
  };
  return (
    <Badge className={cn("hover:bg-inherit", map[status] ?? "bg-slate-100 text-slate-700")}>
      {labels[status] ?? status}
    </Badge>
  );
}

function contactLabel(ticket: SupportTicket | ContactMessage) {
  if (ticket.user) {
    return `${ticket.user.firstName ?? ""} ${ticket.user.lastName ?? ""}`.trim() || ticket.user.email;
  }
  return ticket.guestName ?? "Gast";
}

function contactEmail(ticket: SupportTicket | ContactMessage) {
  return ticket.user?.email ?? ticket.guestEmail ?? "—";
}

export default function AdminSupportTab({ tickets, messages, onReload }: Props) {
  const [subTab, setSubTab] = useState<"tickets" | "contact">("tickets");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});

  const handleTicketUpdate = async (id: string) => {
    await fetch(`/api/admin/support-tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: statusDraft[id],
        adminReply: replyDraft[id] ?? "",
      }),
    });
    setReplyDraft((d) => ({ ...d, [id]: "" }));
    onReload();
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
        <Button
          size="sm"
          variant={subTab === "tickets" ? "default" : "ghost"}
          onClick={() => setSubTab("tickets")}
        >
          Support-Tickets ({tickets.length})
        </Button>
        <Button
          size="sm"
          variant={subTab === "contact" ? "default" : "ghost"}
          onClick={() => setSubTab("contact")}
        >
          Kontakt-Nachrichten ({messages.length})
        </Button>
      </div>

      {subTab === "tickets" ? (
        tickets.length === 0 ? (
          <p className="text-slate-500">Keine Support-Tickets vorhanden.</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <p className="text-sm text-slate-500">
                    {contactLabel(ticket)} ({contactEmail(ticket)})
                  </p>
                </div>
                {ticketStatusBadge(ticket.status)}
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{ticket.message}</p>
              {ticket.adminReply && (
                <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                  <span className="font-medium">Antwort:</span> {ticket.adminReply}
                </p>
              )}
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <select
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  value={statusDraft[ticket.id] ?? ticket.status}
                  onChange={(e) =>
                    setStatusDraft((d) => ({ ...d, [ticket.id]: e.target.value }))
                  }
                >
                  <option value="Open">Offen</option>
                  <option value="InProgress">In Bearbeitung</option>
                  <option value="Closed">Geschlossen</option>
                </select>
                <textarea
                  placeholder="Antwort an den Nutzer (wird im Ticket angezeigt) …"
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  value={replyDraft[ticket.id] ?? ""}
                  onChange={(e) =>
                    setReplyDraft((d) => ({ ...d, [ticket.id]: e.target.value }))
                  }
                />
                <Button size="sm" onClick={() => handleTicketUpdate(ticket.id)}>
                  Ticket aktualisieren
                </Button>
              </div>
            </div>
          ))
        )
      ) : messages.length === 0 ? (
        <p className="text-slate-500">Keine Kontakt-Nachrichten vorhanden.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">
              {contactLabel(msg)} ({contactEmail(msg)})
            </p>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{msg.message}</p>
            <p className="mt-2 text-xs text-slate-400">
              {new Date(msg.createdAt).toLocaleString("de-DE")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
