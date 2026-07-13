# Server-Deployment

Dieses Verzeichnis enthält die Konfiguration für den Betrieb auf einem Linux-Server mit zwei Umgebungen auf derselben Maschine:

| Umgebung | Domain | Trigger |
|----------|--------|---------|
| **Test** | `test.klick-and-zeugnis.de` | Push auf `main` |
| **Produktion** | `klick-and-zeugnis.de` | GitHub Release veröffentlichen |

## Architektur

```text
Internet :80/:443
        │
   ┌────▼────┐
   │ Traefik │  Let's Encrypt TLS, Routing nach Hostname
   └────┬────┘
        │
   ┌────┴────────────────────────┐
   │                             │
┌──▼──────────┐          ┌──────▼───────┐
│ Test-Stack  │          │ Prod-Stack   │
│ MongoDB+App │          │ MongoDB+App  │
└─────────────┘          └──────────────┘
```

Jede Umgebung hat eine **eigene MongoDB** und eigene Docker-Volumes. Die Images werden in der **GHCR** gespeichert.

## Einmalige Server-Einrichtung

### 1. Voraussetzungen

- Linux-Server (Ubuntu 22.04+ empfohlen)
- Docker + Docker Compose Plugin
- DNS: `klick-and-zeugnis.de` und `test.klick-and-zeugnis.de` → Server-IP
- Ports 80 und 443 offen

### 2. Deploy-Verzeichnis anlegen

```bash
sudo mkdir -p /opt/klick-and-zeugnis
sudo chown "$USER":"$USER" /opt/klick-and-zeugnis
```

Repository klonen oder `deploy/`-Ordner kopieren, dann:

```bash
bash deploy/scripts/setup-server.sh
```

### 3. Umgebungsdateien erstellen

Ersetze `DEIN_GITHUB_USER` durch deinen GitHub-Benutzernamen (kleingeschrieben).

**Test:** `/opt/klick-and-zeugnis/test/.env`

```env
GHCR_IMAGE_APP=ghcr.io/dein-github-user/klick-and-zeugnis.de-app
GHCR_IMAGE_DB_INIT=ghcr.io/dein-github-user/klick-and-zeugnis.de-db-init
IMAGE_TAG=test
NEXTAUTH_SECRET=<langer-zufallsstring-fuer-test>
OPENAI_API_KEY=
RUN_DB_SEED=false
FORCE_SEED_RESET=false
```

**Produktion:** `/opt/klick-and-zeugnis/prod/.env`

```env
GHCR_IMAGE_APP=ghcr.io/dein-github-user/klick-and-zeugnis.de-app
GHCR_IMAGE_DB_INIT=ghcr.io/dein-github-user/klick-and-zeugnis.de-db-init
IMAGE_TAG=prod
NEXTAUTH_SECRET=<anderer-langer-zufallsstring-fuer-prod>
OPENAI_API_KEY=
RUN_DB_SEED=false
FORCE_SEED_RESET=false
```

**Traefik:** `/opt/klick-and-zeugnis/traefik/.env`

```env
ACME_EMAIL=kontakt@klick-and-zeugnis.de
```

Traefik holt automatisch **Let's Encrypt**-Zertifikate per HTTP-Challenge (Port 80 muss erreichbar sein).

**DNS für Produktion:**
- `klick-and-zeugnis.de` → Server-IP (A-Record)
- `www.klick-and-zeugnis.de` → Server-IP (A-Record oder CNAME auf Apex)

Nach dem ersten Prod-Deploy kann die Zertifikatsausstellung bis zu 2 Minuten dauern.

> `NEXTAUTH_SECRET` muss pro Umgebung unterschiedlich sein. Test und Produktion dürfen nicht denselben Secret teilen.

### 4. Self-Hosted GitHub Actions Runner (kostenlos)

Statt kostenpflichtiger GitHub-hosted Runner läuft alles auf deinem Server (`188.245.247.164`).

**Voraussetzungen:** User `deploy` in der Gruppe `docker`.

1. Token holen: **GitHub → Repository → Settings → Actions → Runners → New self-hosted runner**
2. Auf dem Server:

```bash
ssh deploy@188.245.247.164
export RUNNER_TOKEN=dein_einmaliger_token
bash /opt/klick-and-zeugnis/scripts/install-github-runner.sh
```

Der Runner bekommt das Label **`klick`**. Alle Workflows nutzen `runs-on: [self-hosted, klick]`.

Status prüfen:

```bash
sudo /opt/actions-runner/svc.sh status
```

GitHub → **Settings → Actions → Runners** → Runner sollte **Idle** (grün) sein.

> **Hinweis:** Self-hosted Runner sind für private Repos **kostenlos** (keine Actions-Minuten). Der Build läuft direkt auf dem Server – SSH-Secrets werden nicht mehr benötigt.

## GitHub-Konfiguration

### Repository Secrets

| Secret | Beschreibung |
|--------|--------------|
| `DEPLOY_GHCR_TOKEN` | GitHub PAT mit `read:packages` und `write:packages` (Image Pull/Push) |

`SSH_HOST`, `SSH_USER` und `SSH_PRIVATE_KEY` werden mit Self-Hosted Runner **nicht mehr benötigt**.

### GitHub Environments

Lege zwei Environments an (Settings → Environments):

1. **`test`** – für Deployments von `main`
2. **`production`** – für Produktions-Releases (optional: Required Reviewers aktivieren)

Trage die Secrets in beiden Environments ein (oder als Repository-Secrets).

### GHCR-Pakete

Nach dem ersten Workflow-Lauf erscheinen die Images unter:

- `ghcr.io/<user>/klick-and-zeugnis.de-app`
- `ghcr.io/<user>/klick-and-zeugnis.de-db-init`

Unter **Package settings** die Sichtbarkeit prüfen. Bei privaten Paketen ist `DEPLOY_GHCR_TOKEN` Pflicht.

### Workflow-Ablauf

| Event | Workflow | Image-Tag | Collection-Präfix |
|-------|----------|-----------|-------------------|
| Push `main` | `deploy-test.yml` | `test-<sha>` | `test_` |
| Release published | `deploy-prod.yml` | `<release-tag>` (z. B. `v1.0.0`) | `prod_` |

### Produktion releasen

```bash
git tag v1.0.0
git push origin v1.0.0
```

Dann auf GitHub: **Releases → Draft a new release → Tag `v1.0.0` → Publish release**

## Manuelles Deploy (Notfall)

```bash
export GHCR_TOKEN=<pat>
export GHCR_USERNAME=<github-user>
/opt/klick-and-zeugnis/scripts/deploy.sh test test-<commit-sha>
/opt/klick-and-zeugnis/scripts/deploy.sh prod v1.0.0
```

## Nützliche Befehle auf dem Server

```bash
# Status
cd /opt/klick-and-zeugnis/test && docker compose ps
cd /opt/klick-and-zeugnis/prod && docker compose ps

# Logs
cd /opt/klick-and-zeugnis/test && docker compose logs -f app

# Traefik
cd /opt/klick-and-zeugnis/traefik && docker compose -p klick-proxy-stack logs -f
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

MongoDB und App-Ports werden **nicht** nach außen exponiert – nur Traefik auf 80/443.
