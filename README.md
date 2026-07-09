# Klick & Zeugnis

Next.js-Anwendung zur KI-gestützten Erstellung von Schulzeugnissen.

## Schnellstart mit Docker (empfohlen)

Die komplette Anwendung inklusive MongoDB läuft in Docker-Containern – ohne lokale Node.js-Installation.

### 1. Umgebungsvariablen einrichten

```bash
copy .env.docker.example .env
```

Passe mindestens `NEXTAUTH_SECRET` an (langer Zufallsstring). `OPENAI_API_KEY` ist optional.

### 2. Stack starten

```bash
npm run docker:up
```

oder direkt:

```bash
docker compose up -d --build
```

Beim ersten Start passiert automatisch:

1. MongoDB startet (mit Replica Set für Prisma-Transaktionen)
2. `db-init` legt Schema an und spielt Testdaten ein
3. Die Next.js-App startet auf Port 3000

### 3. Anwendung öffnen

- **App:** [http://localhost:3000](http://localhost:3000)
- **Test-Login:** `test@example.com` / `secret123`
- **Admin-Login:** `admin@example.com` / `admin123`

### Docker-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `npm run docker:up` | App + MongoDB bauen und starten |
| `npm run docker:down` | Alle Container stoppen |
| `npm run docker:logs` | App-Logs live anzeigen |
| `npm run docker:logs:all` | Logs aller Services |
| `npm run docker:restart` | App-Container neu starten |
| `npm run docker:build` | Images neu bauen |
| `npm run db:reset` | Volumes löschen und Stack neu aufsetzen |

### Konfiguration (`.env`)

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `APP_PORT` | `3000` | Port der Web-App auf dem Host |
| `MONGODB_PORT` | `27017` | Port von MongoDB auf dem Host |
| `MONGODB_COLLECTION_PREFIX` | `local_` | Prisma Collection-Präfix (Build-Zeit!) |
| `NEXTAUTH_URL` | `http://localhost:3000` | Öffentliche URL der App |
| `NEXTAUTH_SECRET` | – | Pflicht: Geheimer Session-Schlüssel |
| `OPENAI_API_KEY` | – | Optional: ohne Key wird Mock-Text genutzt |
| `RUN_DB_SEED` | `true` | Testdaten beim Start einspielen |
| `FORCE_SEED_RESET` | `false` | Bei `true`: alle Daten vor Seed löschen |

**Hinweis:** `MONGODB_COLLECTION_PREFIX` wird beim Docker-Build in Prisma eingefroren. Nach Änderung des Präfixes `docker compose build --no-cache` ausführen.

Datenbank komplett zurücksetzen:

```bash
npm run db:reset
```

## Lokale Entwicklung (ohne App-Container)

Falls du nur MongoDB in Docker nutzen und die App lokal mit Hot-Reload entwickeln möchtest:

### Voraussetzungen

- [Node.js](https://nodejs.org/) 20 LTS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Abhängigkeiten und Umgebung

```bash
npm install
copy .env.docker.example .env
```

Setze in `.env` für lokale Entwicklung:

```env
DATABASE_URL=mongodb://localhost:27017/klick-and-zeugnis?directConnection=true
MONGODB_COLLECTION_PREFIX=dev_
```

### 2. Nur MongoDB starten

```bash
npm run docker:db-only
```

### 3. Datenbank einrichten

```bash
npm run db:setup
```

### 4. Entwicklungsserver

```bash
npm run dev
```

## Nützliche Befehle (lokale Entwicklung)

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run lint` | ESLint ausführen |
| `npm run db:push` | Prisma-Schema in die DB schreiben |
| `npm run db:seed` | Testdaten einspielen |
| `npm run db:reseed` | Daten löschen und neu seeden |

## Windows ARM64 (Snapdragon)

`PRISMA_CLIENT_ENGINE_TYPE=binary` ist in `.env.docker.example` gesetzt. Falls Probleme auftreten, nutze die **x64-Version von Node.js 20 LTS** für lokale Entwicklung.

## Architektur (Docker)

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   mongodb   │────▶│   db-init   │────▶│     app     │
│  (mongo:7)  │     │ (einmalig)  │     │  (Next.js)  │
│  Port 27017 │     │ push + seed │     │  Port 3000  │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Server-Deployment (Test + Produktion)

Für den Betrieb auf einem Linux-Server mit automatischem Deploy via GitHub Actions:

- **Test:** `test.klick-and-zeugnis.de` ← Push auf `main`
- **Produktion:** `klick-and-zeugnis.de` ← GitHub Release

Ausführliche Anleitung: [deploy/README.md](deploy/README.md)

## Technologie-Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Auth:** NextAuth.js (Credentials)
- **Datenbank:** MongoDB (Prisma ORM)
- **KI:** OpenAI API
- **Deployment:** Docker Compose
