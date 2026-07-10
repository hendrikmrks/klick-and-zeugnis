#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:?Umgebung erforderlich: test oder prod}"
IMAGE_TAG="${2:?Image-Tag erforderlich}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_DIR="${DEPLOY_ROOT}/${ENVIRONMENT}"

if [[ ! -d "${ENV_DIR}" ]]; then
  echo "Umgebungsverzeichnis nicht gefunden: ${ENV_DIR}"
  exit 1
fi

if [[ ! -f "${ENV_DIR}/.env" ]]; then
  echo "Fehlende ${ENV_DIR}/.env – bitte aus .env.example anlegen."
  exit 1
fi

cd "${ENV_DIR}"

export IMAGE_TAG
export COMPOSE_PROJECT_NAME="klick-${ENVIRONMENT}"

if [[ -n "${GHCR_TOKEN:-}" && -n "${GHCR_USERNAME:-}" ]]; then
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin
fi

echo "==> Pull Images (${IMAGE_TAG})"
docker compose pull

echo "==> Datenbank-Migrationen"
if [[ "${ENVIRONMENT}" == "test" ]]; then
  export RUN_DB_SEED=true
  export FORCE_SEED_RESET=true
  export SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-mail@hendrik-beier.de}"
  export SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-12092025}"
else
  export RUN_DB_SEED=false
  export FORCE_SEED_RESET=false
fi
docker compose --profile init run --rm db-init

echo "==> Services starten"
docker compose up -d --remove-orphans --force-recreate app

docker image prune -f

echo "==> Verifiziere Routing"
APP_CONTAINER="$(docker compose ps -q app)"
if [[ -z "${APP_CONTAINER}" ]]; then
  echo "Fehler: App-Container läuft nicht."
  docker compose ps
  exit 1
fi

if ! docker network inspect klick-proxy -f '{{range .Containers}}{{.Name}} {{end}}' | grep -q "$(docker inspect -f '{{.Name}}' "${APP_CONTAINER}" | sed 's#^/##')"; then
  echo "Fehler: App-Container ist nicht am Netzwerk klick-proxy."
  docker network inspect klick-proxy
  docker inspect "${APP_CONTAINER}" --format '{{json .NetworkSettings.Networks}}'
  exit 1
fi

echo "Warte auf App-Healthcheck …"
for _ in $(seq 1 24); do
  HEALTH="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "${APP_CONTAINER}")"
  if [[ "${HEALTH}" == "healthy" || "${HEALTH}" == "none" ]]; then
    break
  fi
  sleep 5
done

if [[ "${ENVIRONMENT}" == "test" ]]; then
  echo "Warte auf Traefik-Routing …"
  ROUTING_OK=false
  for _ in $(seq 1 12); do
    if curl -sfk --resolve "test.klick-and-zeugnis.de:443:127.0.0.1" https://test.klick-and-zeugnis.de/ >/dev/null; then
      ROUTING_OK=true
      break
    fi
    sleep 5
  done

  if [[ "${ROUTING_OK}" != "true" ]]; then
    echo "Fehler: Traefik liefert keine Antwort für test.klick-and-zeugnis.de."
    docker logs klick-traefik --tail 80 || true
    docker logs "${APP_CONTAINER}" --tail 80 || true
    docker inspect "${APP_CONTAINER}" --format '{{json .Config.Labels}}'
    exit 1
  fi
fi

echo "==> Deploy abgeschlossen: ${ENVIRONMENT} (${IMAGE_TAG})"
docker compose ps
