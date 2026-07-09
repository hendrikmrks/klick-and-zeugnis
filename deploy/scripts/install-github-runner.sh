#!/usr/bin/env bash
# GitHub Actions Self-Hosted Runner – funktioniert ohne sudo (User "deploy").
set -euo pipefail

RUNNER_VERSION="${RUNNER_VERSION:-2.323.0}"
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
REPO_URL="${REPO_URL:-https://github.com/hendrikmrks/klick-and-zeugnis.de}"
RUNNER_NAME="${RUNNER_NAME:-klick-server}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,Linux,X64,klick}"

if [[ -z "${RUNNER_TOKEN:-}" ]]; then
  echo "Fehler: RUNNER_TOKEN fehlt."
  echo "Token: GitHub → Settings → Actions → Runners → New self-hosted runner"
  exit 1
fi

for cmd in curl tar; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Fehler: '$cmd' fehlt. Bitte als root installieren:"
    echo "  apt-get install -y curl tar rsync"
    exit 1
  fi
done

echo "==> Runner-Verzeichnis: ${RUNNER_DIR}"
mkdir -p "${RUNNER_DIR}"
cd "${RUNNER_DIR}"

if [[ ! -f ./config.sh ]]; then
  echo "==> Lade Runner v${RUNNER_VERSION}"
  curl -fsSL -o actions-runner.tar.gz \
    "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  tar xzf actions-runner.tar.gz
  rm actions-runner.tar.gz
fi

./config.sh \
  --url "${REPO_URL}" \
  --token "${RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${RUNNER_LABELS}" \
  --work _work \
  --unattended \
  --replace

install_system_service() {
  if sudo -n true 2>/dev/null; then
    echo "==> Installiere Systemd-Service (sudo)"
    sudo ./svc.sh install "$(whoami)"
    sudo ./svc.sh start
    sudo ./svc.sh status
    return 0
  fi
  return 1
}

install_user_service() {
  echo "==> Installiere User-Systemd-Service (ohne sudo)"
  ./svc.sh install
  ./svc.sh start
  systemctl --user status "actions.runner.${RUNNER_NAME}" --no-pager || ./svc.sh status
}

if install_system_service; then
  :
elif install_user_service; then
  echo ""
  echo "Hinweis: User-Service startet nach Reboot nur mit aktiver Login-Session."
  echo "Dauerhaft aktivieren (einmalig als deploy):"
  echo "  loginctl enable-linger \$USER"
else
  echo ""
  echo "Service-Installation fehlgeschlagen. Runner manuell starten:"
  echo "  cd ${RUNNER_DIR} && ./run.sh"
  echo ""
  echo "Für Autostart nach Reboot (User-Service):"
  echo "  loginctl enable-linger deploy"
  echo "  cd ${RUNNER_DIR} && ./svc.sh install && ./svc.sh start"
fi

echo ""
echo "Fertig. Prüfen: GitHub → Settings → Actions → Runners"
echo "Label: klick"
