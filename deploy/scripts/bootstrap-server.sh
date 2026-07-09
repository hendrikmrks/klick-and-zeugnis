#!/usr/bin/env bash
# Auf dem Linux-Server als User mit Docker-Rechten ausführen.
# Vorher: deploy-Ordner nach /opt/klick-and-zeugnis kopieren oder per GitHub Actions deployen lassen.
set -euo pipefail

DEPLOY_ROOT="/opt/klick-and-zeugnis"
GITHUB_USER="hendrikmrks"

mkdir -p "${DEPLOY_ROOT}/traefik" "${DEPLOY_ROOT}/test" "${DEPLOY_ROOT}/prod" "${DEPLOY_ROOT}/scripts"

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker installiert. Bitte einmal ab- und wieder anmelden, dann Skript erneut starten."
  exit 0
fi

docker network inspect klick-proxy >/dev/null 2>&1 || docker network create klick-proxy

if [[ ! -f "${DEPLOY_ROOT}/traefik/.env" ]]; then
  cat > "${DEPLOY_ROOT}/traefik/.env" <<'EOF'
ACME_EMAIL=admin@klick-and-zeugnis.de
EOF
  echo "Erstellt: ${DEPLOY_ROOT}/traefik/.env"
fi

if [[ ! -f "${DEPLOY_ROOT}/test/.env" ]]; then
  TEST_SECRET="$(openssl rand -base64 48)"
  cat > "${DEPLOY_ROOT}/test/.env" <<EOF
GHCR_IMAGE_APP=ghcr.io/${GITHUB_USER}/klick-and-zeugnis.de-app
GHCR_IMAGE_DB_INIT=ghcr.io/${GITHUB_USER}/klick-and-zeugnis.de-db-init
IMAGE_TAG=test
NEXTAUTH_SECRET=${TEST_SECRET}
OPENAI_API_KEY=
RUN_DB_SEED=false
FORCE_SEED_RESET=false
EOF
  echo "Erstellt: ${DEPLOY_ROOT}/test/.env (NEXTAUTH_SECRET automatisch generiert)"
fi

if [[ ! -f "${DEPLOY_ROOT}/prod/.env" ]]; then
  PROD_SECRET="$(openssl rand -base64 48)"
  cat > "${DEPLOY_ROOT}/prod/.env" <<EOF
GHCR_IMAGE_APP=ghcr.io/${GITHUB_USER}/klick-and-zeugnis.de-app
GHCR_IMAGE_DB_INIT=ghcr.io/${GITHUB_USER}/klick-and-zeugnis.de-db-init
IMAGE_TAG=prod
NEXTAUTH_SECRET=${PROD_SECRET}
OPENAI_API_KEY=
RUN_DB_SEED=false
FORCE_SEED_RESET=false
EOF
  echo "Erstellt: ${DEPLOY_ROOT}/prod/.env (NEXTAUTH_SECRET automatisch generiert)"
fi

if [[ -f "${DEPLOY_ROOT}/traefik/docker-compose.yml" ]]; then
  cd "${DEPLOY_ROOT}/traefik"
  docker compose -p klick-proxy-stack up -d
  echo "Traefik gestartet."
else
  echo "Hinweis: traefik/docker-compose.yml fehlt noch – wird beim ersten GitHub-Deploy hochgeladen."
fi

echo ""
echo "Server-Basissetup fertig."
echo "Nächster Schritt: Öffentlichen SSH-Deploy-Key in ~/.ssh/authorized_keys eintragen."
