# Beitragen zu Klick & Zeugnis

Danke für dein Interesse, zu Klick & Zeugnis beizutragen! Dieses Dokument
beschreibt, wie du das Projekt lokal zum Laufen bringst, welche Regeln für
Pull Requests gelten und wie du Fehler meldest.

Für alle, die sich beteiligen, gilt unser [Code of Conduct](CODE_OF_CONDUCT.md).
Mit deiner Teilnahme an diesem Projekt erklärst du dich damit einverstanden,
ihn einzuhalten.

## Lizenz-Hinweis (AGPL-3.0)

Das Projekt steht unter der **GNU Affero General Public License v3.0**
(siehe [LICENSE](LICENSE)). Das hat eine wichtige Konsequenz, die über eine
klassische GPL hinausgeht: Wenn du eine **modifizierte Version dieses Codes
betreibst und Nutzer:innen darauf über ein Netzwerk zugreifen lässt** (z. B.
als eigener gehosteter Dienst), musst du deine Änderungen ebenfalls unter der
AGPL-3.0 offenlegen – auch dann, wenn du die Software selbst nicht
weitergibst, sondern nur als Onlinedienst anbietest. Beachte das, bevor du
eigene Deployments mit Änderungen betreibst.

## Voraussetzungen

- [Node.js](https://nodejs.org/) 20 LTS (`package.json` fordert `>=20 <23`)
- [Docker](https://www.docker.com/) inkl. Docker Compose Plugin
- Ein Git-Client sowie ein GitHub-Account für Pull Requests

## Lokales Setup

1. Repository forken und klonen:

   ```bash
   git clone https://github.com/<dein-user>/klick-and-zeugnis.git
   cd klick-and-zeugnis
   npm install
   ```

2. Umgebungsvariablen einrichten:

   ```bash
   cp .env.example .env
   ```

   Passe mindestens `NEXTAUTH_SECRET` an. `OPENAI_API_KEY` ist optional –
   ohne Key nutzt die App automatisch Mock-Texte statt echter
   KI-Generierung, das reicht für die meisten Entwicklungsaufgaben.

3. MongoDB per Docker starten (Replica Set wird automatisch initialisiert):

   ```bash
   npm run docker:db-only
   ```

   Alternativ kannst du auch den kompletten Stack (App + DB) über
   `npm run docker:up` bzw. `docker compose up -d --build` starten; siehe
   [README.md](README.md#schnellstart-mit-docker-kompletter-stack).

4. Datenbank einrichten und mit Testdaten befüllen:

   ```bash
   npm run db:setup
   ```

   Das führt `prisma db push` (Schema anwenden) und `prisma/seed.ts`
   (Testdaten) aus. Der Seed legt u. a. einen Test-Login
   (`test@example.com` / `secret123`) und zwei Admin-Logins
   (`admin@example.com` / `admin123` sowie `mail@hendrik-beier.de` /
   `admin123`) an.

   Um die Datenbank komplett zurückzusetzen und neu zu seeden:

   ```bash
   npm run db:reseed
   ```

   Nach Änderungen an `prisma/schema.prisma` genügt in der Regel:

   ```bash
   npm run db:push
   ```

5. Entwicklungsserver starten:

   ```bash
   npm run dev
   ```

   Die App läuft danach unter [http://localhost:3000](http://localhost:3000).

## Qualitätssicherung vor einem Pull Request

Dieses Projekt nutzt aktuell folgende Prüfungen, die auch in der CI
(`.github/workflows/ci.yml`) für jeden Pull Request auf `main` laufen:

```bash
npm run lint    # ESLint (next lint)
npm run build   # Produktions-Build (inkl. Prisma-Generierung)
```

Führe beide Befehle lokal aus, bevor du einen Pull Request öffnest. Es gibt
aktuell kein separates Test- oder Typecheck-Skript in `package.json` –
TypeScript-Fehler werden im Rahmen von `npm run build` mit erfasst.

## Branch- und Pull-Request-Workflow

1. Erstelle für deine Änderung einen eigenen Branch von `main`, z. B.
   `feature/kurzbeschreibung` oder `fix/kurzbeschreibung`.
2. Halte Commits nachvollziehbar und beschreibend.
3. Stelle sicher, dass `npm run lint` und `npm run build` ohne Fehler
   durchlaufen.
4. Öffne einen Pull Request gegen `main` und beschreibe kurz, **was** sich
   ändert und **warum**. Verlinke ggf. ein zugehöriges Issue.
5. Pull Requests werden vor dem Merge geprüft; die CI muss grün sein.

## Fehler melden

Bitte melde Bugs und Sicherheitsprobleme (sofern unkritisch) über die
[GitHub Issues](https://github.com/hendrikmrks/klick-and-zeugnis/issues) des
Repositories. Gib dabei möglichst an:

- Was hast du erwartet, was ist tatsächlich passiert?
- Schritte zur Reproduktion.
- Umgebung (Node-Version, lokal vs. Docker, Browser).
- Relevante Logs oder Fehlermeldungen (`npm run docker:logs` bzw.
  `npm run docker:logs:all` im Docker-Betrieb).

Da die ursprüngliche Live-Instanz nicht mehr betrieben wird, beziehen sich
alle Meldungen auf den selbst betriebenen bzw. lokalen Stand des Codes.

## Fragen

Bei allgemeinen Fragen zum Projekt kannst du gerne ein GitHub Issue eröffnen.
