# Klick & Zeugnis

![License](https://img.shields.io/github/license/hendrikmrks/klick-and-zeugnis)

Klick & Zeugnis ist eine Next.js-Webanwendung, die Lehrkräfte dabei unterstützt,
**Zeugnistexte für Schulzeugnisse** auf Basis einiger weniger Eckdaten
KI-gestützt zu formulieren – statt jeden Text von Hand zu schreiben.

> **Hinweis:** Die frühere Live-Instanz unter `klick-and-zeugnis.de` ist nicht
> mehr erreichbar. Dieses Repository ist der öffentlich gemachte Quellcode des
> Projekts und dient als Referenz bzw. Grundlage für einen eigenen,
> selbstgehosteten Betrieb.

## Worum geht es?

Zielgruppe sind **Lehrkräfte**, die für ihre Schülerinnen und Schüler
individuelle Zeugnisformulierungen (z. B. zu Sozialverhalten und Rollen/Ämtern
in der Klasse) verfassen müssen. Anstatt jeden Text komplett neu zu schreiben,
gibt die Lehrkraft strukturierte Parameter ein – Name, Geschlecht, Klasse,
Sozialverhalten, Rollen in der Klasse und den gewünschten Sprachstil – und
erhält daraus einen KI-generierten, für ein Zeugnis passenden Fließtext, den
sie speichern, als PDF exportieren oder erneut anpassen kann.

## Funktionen

- **KI-gestützte Zeugnistext-Generierung** über die OpenAI Chat-Completions-API
  anhand von Name, Geschlecht, Klasse/Klassenstufe, Sozialverhalten und Rollen
  in der Klasse (`src/app/api/certificate/generate/route.ts`,
  `src/lib/certificate-style.ts`).
- **Stil-Presets** für den generierten Text: *Standard*, *Kürzer*, *Formeller*,
  *Wärmer* – steuern System- und User-Prompt an die OpenAI-API.
- **Mock-Textgenerierung ohne API-Key:** Ist kein `OPENAI_API_KEY` hinterlegt,
  erzeugt die App automatisch einen deterministischen Platzhaltertext, damit
  die Anwendung auch ohne OpenAI-Zugang lauffähig bleibt.
- **Zeugnisse speichern & verwalten** inklusive **PDF-Export** (`jspdf`,
  `src/lib/export-certificate-pdf.ts`).
- **Tarif-/Limitsystem** mit den Stufen `Free`, `Pro`, `Premium`, `Vip`:
  monatliches Limit an KI-Generierungen sowie Limit an gespeicherten
  Zeugnissen pro Stufe (`src/lib/plan-limits.ts`). Tarif-Upgrades laufen als
  manuell durch die Administration geprüfte Anfrage inkl. Rechnungsdaten
  (`SubscriptionRequest`); eine echte Zahlungsabwicklung ist laut UI
  ausdrücklich noch **nicht** integriert.
- **Datenschutz Advanced Modus:** Auf Wunsch werden Namen von Schülerinnen und
  Schülern beim Speichern durch Zufallsplatzhalter ersetzt. Die Zuordnung
  liegt ausschließlich verschlüsselt in einer vom Nutzer verwalteten
  Schlüsseldatei, die pro Sitzung befristet hochgeladen wird
  (`src/lib/privacy-advanced/`).
- **Authentifizierung** über NextAuth (Credentials-Provider, Passwort-Hashing
  mit `bcryptjs`) inklusive optionaler **Zwei-Faktor-Authentifizierung
  (TOTP)** mit QR-Code-Einrichtung (`otplib`, `qrcode`, `src/lib/totp.ts`).
- **Account-Schutz:** Sperren von Nutzerkonten durch Admins sowie eine
  IP-/E-Mail-Sperrliste (`BlocklistEntry`).
- **Admin-Bereich** (`/admin`, nur für Rolle `Admin`) mit:
  - Übersicht/Statistiken, Nutzerverwaltung (inkl. Sperren),
  - Prüfung & Freigabe von Tarif-Upgrade-Anfragen,
  - Prüfung gemeldeter Zeugnis-Texte (`CertificateReport`),
  - Support-Ticket- und Kontaktnachrichten-Verwaltung,
  - FAQ-Pflege,
  - **OpenAI-Nutzungs- und Kostenauswertung** (Tokens, geschätzte Kosten in
    USD/EUR) je Generierung (`src/lib/openai-usage.ts`).
- **Hilfe-/Support-Bereich** mit FAQ, Kontaktformular und Support-Tickets für
  eingeloggte Nutzer und Gäste.
- **Rechtsseiten** für den Produktivbetrieb: Impressum, Datenschutz, AGB,
  Widerruf (`src/app/impressum`, `src/app/datenschutz`, `src/app/agb`,
  `src/app/widerruf`).

## Architektur

- **Next.js 15 (App Router)** mit React 19 und Tailwind CSS als Frontend/SSR.
- **Prisma ORM** gegen **MongoDB** (Replica Set, da Prisma für MongoDB
  Transaktionen ein Replica Set voraussetzt) als Datenschicht.
- **NextAuth.js** (JWT-Sessions, Credentials-Provider) für Authentifizierung
  und rollenbasierte Autorisierung (`src/middleware.ts` schützt
  `/dashboard`, `/settings`, `/subscription`, `/reports`, `/analytics`,
  `/admin`).
- **OpenAI API** (`openai` SDK) für die eigentliche Zeugnistext-Generierung,
  mit Fallback auf lokal erzeugten Mock-Text ohne API-Key.
- **API-Routen** unter `src/app/api/**` (Route Handlers) für Zertifikate,
  Admin-Funktionen, Auth, Support, Abonnements u. a.
- **Docker Compose** für lokale Entwicklung (App + MongoDB + einmaliger
  `db-init`-Dienst) sowie separate Deploy-Konfiguration für Test-/
  Produktivbetrieb hinter Traefik (`deploy/`).

Das Prisma-Schema nutzt ein Platzhalter-Präfix `__PREFIX__` in den
Collection-Namen (`prisma/schema.prisma`), das vor jedem Start/Build durch
`scripts/sync-prisma-collections.mjs` anhand von
`MONGODB_COLLECTION_PREFIX` aufgelöst und nach
`prisma/.schema.resolved.prisma` geschrieben wird. So können mehrere
Umgebungen (`dev_`, `local_`, `test_`, `prod_`) dieselbe MongoDB-Datenbank
nutzen, ohne sich Collections zu teilen.

## Technologie-Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, Radix UI, `lucide-react`
- **Auth:** NextAuth.js 4 (Credentials-Provider, JWT-Sessions), `bcryptjs`,
  `otplib` + `qrcode` für TOTP-basierte 2FA
- **Datenbank:** MongoDB (Replica Set), Prisma ORM (`prisma`, `@prisma/client`)
- **KI:** OpenAI API (`openai` SDK)
- **PDF-Export:** `jspdf`
- **Sprache/Tooling:** TypeScript, ESLint (`next lint`)
- **Deployment/Betrieb:** Docker, Docker Compose, Traefik (Let's Encrypt TLS),
  GitHub Actions, GitHub Container Registry (GHCR)

## Voraussetzungen

- [Node.js](https://nodejs.org/) 20 LTS (laut `package.json`: `>=20 <23`)
- [Docker](https://www.docker.com/) inkl. Docker Compose Plugin
- Optional: ein OpenAI-API-Key für echte KI-Generierung (ohne Key wird
  automatisch Mock-Text verwendet)

## Lokales Setup

### 1. Repository klonen & Abhängigkeiten installieren

```bash
git clone https://github.com/hendrikmrks/klick-and-zeugnis.git
cd klick-and-zeugnis
npm install
```

### 2. Umgebungsvariablen

Kopiere `.env.example` nach `.env` und passe die Werte an:

```bash
cp .env.example .env
```

Relevante Variablen aus `.env.example`:

| Variable | Beschreibung |
|----------|--------------|
| `DATABASE_URL` | MongoDB-Verbindungsstring, z. B. `mongodb://localhost:27017/klick-and-zeugnis?directConnection=true` für lokale npm-Entwicklung mit Docker-MongoDB. Im vollständigen Docker-Compose-Stack wird sie automatisch gesetzt. |
| `MONGODB_COLLECTION_PREFIX` | Trennt Umgebungen in derselben Datenbank: `dev_` für lokale npm-Entwicklung, `local_` (Standard im Docker-Stack), `prod_` für Produktion. |
| `NEXTAUTH_URL` | Öffentliche URL der App, z. B. `http://localhost:3000`. |
| `NEXTAUTH_SECRET` | Pflichtfeld: langer, zufälliger Session-Schlüssel. |
| `OPENAI_API_KEY` | Optional. Ohne Key wird Mock-Text statt echter KI-Generierung verwendet. |
| `OPENAI_MODEL` | Optional, überschreibt das verwendete OpenAI-Modell. |
| `OPENAI_USD_TO_EUR` | Optional, Umrechnungskurs für die Kostenanzeige im Admin-Bereich. |
| `EMAIL_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Optional, aktuell deaktiviert – Konfiguration für E-Mail-Versand über Brevo SMTP. |
| `PRISMA_CLIENT_ENGINE_TYPE` | `binary` – u. a. relevant für Windows ARM64. |

Für Cloud-Deployment (z. B. Vercel/Atlas) siehe die zusätzlichen Hinweise am
Ende von `.env.example` (`DATABASE_URL` als `mongodb+srv://…`,
umgebungsabhängiges `MONGODB_COLLECTION_PREFIX`).

### 3. Datenbank starten

Nur MongoDB per Docker starten (App läuft dann lokal mit Hot-Reload):

```bash
npm run docker:db-only
```

### 4. Datenbank einrichten (Schema + Testdaten)

```bash
npm run db:setup
```

Das führt intern `db:push` (Prisma-Schema in die Datenbank schreiben) und
`db:seed` (`prisma/seed.ts`) aus. Der Seed legt – sofern kein
`SEED_ADMIN_PASSWORD` gesetzt ist – folgende Testkonten an:

| Rolle | Login |
|-------|-------|
| Test-Nutzer | `test@example.com` / `secret123` |
| Admin | `admin@example.com` / `admin123` |
| Admin | `mail@hendrik-beier.de` / `admin123` |

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft danach unter [http://localhost:3000](http://localhost:3000).

### Build & Produktion

```bash
npm run build
npm run start
```

`npm run build` führt vor dem eigentlichen Next.js-Build zusätzlich
`scripts/sync-prisma-collections.mjs` und `prisma generate` aus.

### Nützliche npm-Skripte

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run start` | Produktions-Build starten |
| `npm run lint` | ESLint (`next lint`) ausführen |
| `npm run db:push` | Prisma-Schema in die Datenbank schreiben |
| `npm run db:seed` | Testdaten einspielen (`prisma/seed.ts`) |
| `npm run db:setup` | `db:push` + `db:seed` in einem Schritt |
| `npm run db:reseed` | Daten vollständig löschen und neu seeden (`scripts/reseed.mjs`) |
| `npm run db:reset` | Docker-Volumes löschen und Stack neu aufsetzen |
| `npm run prisma:sync` | Collection-Präfix im Prisma-Schema auflösen |
| `npm run docker:up` / `docker:down` | Kompletten Docker-Stack starten/stoppen |
| `npm run docker:db-only` | Nur MongoDB starten |
| `npm run docker:logs` / `docker:logs:all` | Logs des App- bzw. aller Container anzeigen |
| `npm run docker:restart` | App-Container neu starten |
| `npm run docker:build` | Docker-Images neu bauen |

## Schnellstart mit Docker (kompletter Stack)

Alternativ läuft die komplette Anwendung inklusive MongoDB in Containern –
ohne lokale Node.js-Installation:

```bash
cp .env.example .env   # NEXTAUTH_SECRET anpassen, OPENAI_API_KEY optional
npm run docker:up
# oder direkt:
docker compose up -d --build
```

`docker-compose.yml` orchestriert drei Dienste:

1. **`mongodb`** (`mongo:7`) – startet mit aktiviertem Replica Set (`rs0`),
   das Prisma für Transaktionen auf MongoDB benötigt. Ein Healthcheck
   initialisiert das Replica Set automatisch.
2. **`db-init`** – einmaliger Init-Container, der beim Start des Stacks
   läuft und automatisch:
   - das Prisma-Schema synchronisiert und den Prisma-Client generiert,
   - das Schema per `prisma db push` in die Datenbank schreibt,
   - über `prisma/ensure-admin.ts` sicherstellt, dass der über
     `SEED_ADMIN_EMAIL` konfigurierte Nutzer (Standard:
     `mail@hendrik-beier.de`) die Rolle `Admin` hat, auch ohne dass ein
     Seed läuft,
   - abhängig von `RUN_DB_SEED` (Standard `true`) Testdaten einspielt, bei
     `FORCE_SEED_RESET=true` inklusive vollständigem Reset aller
     Anwendungsdaten vor dem Seed.
3. **`app`** – die eigentliche Next.js-Anwendung, startet erst nach
   erfolgreichem Abschluss von `db-init`.

Danach ist die App unter [http://localhost:3000](http://localhost:3000)
erreichbar, mit den oben genannten Testkonten.

Relevante Docker-Umgebungsvariablen (siehe `docker-compose.yml`):
`APP_PORT`, `MONGODB_PORT`, `MONGODB_COLLECTION_PREFIX`, `NEXTAUTH_URL`,
`NEXTAUTH_SECRET`, `OPENAI_API_KEY`, `RUN_DB_SEED`, `FORCE_SEED_RESET`,
`SEED_ADMIN_EMAIL`.

**Hinweis:** `MONGODB_COLLECTION_PREFIX` wird beim Docker-Build in Prisma
eingefroren. Nach Änderung des Präfixes `docker compose build --no-cache`
ausführen.

Datenbank komplett zurücksetzen (Volumes löschen, Stack neu aufsetzen):

```bash
npm run db:reset
```

### Docker-Architektur

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   mongodb   │────▶│   db-init   │────▶│     app     │
│  (mongo:7)  │     │ (einmalig)  │     │  (Next.js)  │
│  Port 27017 │     │ push + seed │     │  Port 3000  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Server-Deployment (Test + Produktion)

Für den Betrieb auf einem eigenen Linux-Server mit automatischem Deploy über
GitHub Actions, Traefik (Let's-Encrypt-TLS) und getrennten Test-/
Produktivumgebungen liegt eine vollständige Anleitung samt Skripten unter
[`deploy/README.md`](deploy/README.md). Da die ursprüngliche Live-Instanz
nicht mehr betrieben wird, dient dies vor allem als Referenz für einen
eigenen Betrieb.

## Projektstruktur

```text
src/
├── app/                     # Next.js App Router
│   ├── api/                 # Route Handlers (Zeugnisse, Admin, Auth, Support …)
│   │   ├── admin/           # Admin-APIs (Nutzer, Tarife, Reports, Support, FAQ, OpenAI-Nutzung)
│   │   ├── auth/            # NextAuth-Route, Registrierung, Pre-Login
│   │   ├── certificate/     # Zeugnis-Generierung, Speichern, Melden, Klassenlisten
│   │   ├── privacy-advanced/# Datenschutz-Advanced-Modus (Schlüsseldatei)
│   │   ├── settings/        # Account-, Passwort-, 2FA-Einstellungen
│   │   └── subscription/    # Tarif-Anfragen, Downgrade
│   ├── admin/                # Admin-Dashboard (Seite)
│   ├── dashboard/, reports/, settings/, subscription/, analytics/
│   ├── auth/                 # Login-/Registrierungsseiten
│   └── agb/, datenschutz/, impressum/, widerruf/, hilfe/   # Rechts- und Hilfeseiten
├── components/                # UI-Komponenten (Zeugnis-Formular, Admin, Abo, Layout, ui/)
├── lib/                        # Geschäftslogik: auth, prisma, plan-limits, subscription,
│                                # certificate-style, openai-usage, privacy-advanced, totp …
├── types/                      # Zusätzliche TypeScript-Typen (u. a. NextAuth-Erweiterung)
└── middleware.ts               # Routenschutz (Auth, Admin-Rolle, gesperrte Nutzer)

prisma/
├── schema.prisma               # Datenmodell (User, Certificate, GeneratedCertificate, …)
├── seed.ts                     # Seed-Skript für Testdaten
└── ensure-admin.ts             # Stellt Admin-Rolle für einen konfigurierten Nutzer sicher

scripts/
├── sync-prisma-collections.mjs # Löst __PREFIX__ im Prisma-Schema auf
└── reseed.mjs                  # Kompletter Datenbank-Reset + Neu-Seed

docker/                          # Docker-Entrypoint & Healthcheck-Hilfsskripte
deploy/                          # Produktiv-/Test-Deployment (Traefik, GitHub Actions, Skripte)
```

## Contributing

Beiträge sind willkommen! Details zum lokalen Setup, Branch-Workflow,
Linting und zur Fehlermeldung findest du in
[CONTRIBUTING.md](CONTRIBUTING.md). Für alle, die sich am Projekt
beteiligen, gilt unser [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Dieses Projekt steht unter der **GNU Affero General Public License v3.0
(AGPL-3.0)**. Der vollständige Lizenztext befindet sich in
[LICENSE](LICENSE).
