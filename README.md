# Klick & Zeugnis

Next.js-Anwendung zur KI-gestützten Erstellung von Schulzeugnissen.

## Voraussetzungen

- [Node.js](https://nodejs.org/) 20 LTS (empfohlen; Node 22+ und Windows ARM64 siehe Hinweis unten)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (für die lokale MongoDB)
- Optional: OpenAI API-Key (ohne Key wird ein Mock-Text generiert)

## Lokale Entwicklung

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen einrichten

Kopiere `.env.example` nach `.env` und passe die Werte an:

```bash
copy .env.example .env
```

Wichtig:
- `NEXTAUTH_SECRET` – beliebiger langer Zufallsstring
- `OPENAI_API_KEY` – optional; ohne gültigen Key wird ein Mock-Zeugnistext erzeugt

### 3. MongoDB in Docker starten

```bash
npm run docker:up
```

Die Datenbank läuft dann auf `localhost:27017` (ohne Authentifizierung, nur für lokale Entwicklung).

### 4. Datenbankschema anlegen und Testdaten laden

```bash
npm run db:setup
```

Das legt das Prisma-Schema an und erstellt einen Testbenutzer:
- E-Mail: `test@example.com`
- Passwort: `secret123`

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Die App ist unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Mit Docker starten (App + Datenbank)

Die komplette Anwendung inklusive MongoDB als Container starten:

```bash
copy .env.example .env
docker compose up -d --build
```

Beim ersten Start werden automatisch Datenbankschema und Testdaten angelegt.

- App: [http://localhost:3000](http://localhost:3000)
- Test-Login: `test@example.com` / `secret123`

Optional in `.env` setzen:

```env
NEXTAUTH_SECRET=ein-langer-zufaelliger-string
OPENAI_API_KEY=sk-...
RUN_DB_SEED=true
```

| Befehl | Beschreibung |
|--------|--------------|
| `docker compose up -d --build` | App und MongoDB bauen und starten |
| `docker compose down` | Container stoppen |
| `docker compose logs -f app` | App-Logs anzeigen |
| `docker compose up -d --build app` | Nur App neu bauen |

Nur die Datenbank für lokale Entwicklung mit `npm run dev`:

```bash
docker compose up -d mongodb
```

## Nützliche Befehle (lokale Entwicklung)

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run docker:up` | MongoDB-Container starten |
| `npm run docker:down` | MongoDB-Container stoppen |
| `npm run db:push` | Prisma-Schema in die DB schreiben |
| `npm run db:seed` | Testdaten einspielen |

## Windows ARM64 (Snapdragon)

Auf Windows-ARM-Geräten ist `PRISMA_CLIENT_ENGINE_TYPE=binary` in der `.env` gesetzt. Damit startet Prisma die Query Engine als separaten Prozess (x64-Emulation). Falls weiterhin Probleme auftreten, nutze die **x64-Version von Node.js 20 LTS**.

## Technologie-Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Auth:** NextAuth.js (Credentials)
- **Datenbank:** MongoDB (Prisma ORM)
- **KI:** OpenAI API
