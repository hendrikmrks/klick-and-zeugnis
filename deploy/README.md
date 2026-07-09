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
ACME_EMAIL=admin@klick-and-zeugnis.de
```

> `NEXTAUTH_SECRET` muss pro Umgebung unterschiedlich sein. Test und Produktion dürfen nicht denselben Secret teilen.

### 4. SSH-Zugang für GitHub Actions

Auf dem Server einen dedizierten User anlegen (z. B. `deploy`) und den öffentlichen Schlüssel hinterlegen:

```bash
# Auf dem Server
sudo adduser deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
# Öffentlichen Schlüssel in /home/deploy/.ssh/authorized_keys einfügen
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /opt/klick-and-zeugnis
```

## GitHub-Konfiguration

### Repository Secrets

| Secret | Beschreibung |
|--------|--------------|
| `SSH_HOST` | IP oder Hostname des Servers |
| `SSH_USER` | SSH-Benutzer (z. B. `deploy`) |
| `SSH_PRIVATE_KEY` | Privater SSH-Schlüssel (PEM, ohne Passphrase) |
| `SSH_PORT` | Optional, Standard `22` |
| `DEPLOY_GHCR_TOKEN` | GitHub PAT mit `read:packages` zum Image-Pull auf dem Server |

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
