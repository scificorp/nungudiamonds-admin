#!/usr/bin/env bash
set -euo pipefail

ADMIN_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WORK_ROOT="$(dirname "${ADMIN_DIR}")"
API_DIR="${API_DIR:-${WORK_ROOT}/tcctechapi-nungudiamonds-release}"
OUT_DIR="${ADMIN_DIR}/output/crabbox"
API_PORT="${API_PORT:-2511}"
ADMIN_PORT="${ADMIN_PORT:-3000}"
READY_MARKER="${READY_MARKER:-NUNGU STACK READY}"

mkdir -p "${OUT_DIR}"

log() {
  printf '[nungu-setup] %s\n' "$*"
}

require_dir() {
  local path="$1"
  [[ -d "${path}" ]] || {
    echo "Missing required directory: ${path}" >&2
    exit 1
  }
}

wait_for_tcp() {
  local label="$1"
  local port="$2"
  local attempts="${3:-90}"

  for _ in $(seq 1 "${attempts}"); do
    if timeout 2 bash -lc "</dev/tcp/127.0.0.1/${port}" >/dev/null 2>&1; then
      log "${label} listening on 127.0.0.1:${port}"
      return 0
    fi
    sleep 2
  done

  echo "${label} did not open port ${port}" >&2
  return 1
}

install_deps() {
  local dir="$1"
  local label="$2"

  if [[ -d "${dir}/node_modules" ]]; then
    log "${label} dependencies already present"
    return 0
  fi

  log "installing ${label} dependencies"
  (cd "${dir}" && PUPPETEER_SKIP_DOWNLOAD=true npm ci --legacy-peer-deps --no-audit --no-fund)
}

has_postgres_bins() {
  command -v initdb >/dev/null 2>&1 && command -v pg_ctl >/dev/null 2>&1 && return 0
  compgen -G '/usr/lib/postgresql/*/bin/initdb' >/dev/null
}

ensure_system_tools() {
  local packages=()

  if ! has_postgres_bins; then
    packages+=(postgresql postgresql-client)
  fi

  if ! command -v chromium >/dev/null 2>&1 && [[ ! -x /usr/bin/chromium ]]; then
    packages+=(chromium fonts-liberation)
  fi

  if [[ "${#packages[@]}" -eq 0 ]]; then
    log "system tools already present"
    return 0
  fi

  command -v apt-get >/dev/null 2>&1 || {
    echo "Missing system packages and apt-get is unavailable: ${packages[*]}" >&2
    exit 1
  }

  local apt=(apt-get)
  if [[ "${EUID}" -ne 0 ]]; then
    apt=(sudo apt-get)
  fi

  log "installing system packages: ${packages[*]}"
  "${apt[@]}" update
  "${apt[@]}" install -y --no-install-recommends "${packages[@]}"
}

ensure_node22() {
  local major
  major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || true)"
  if [[ "${major}" == "22" ]]; then
    log "Node 22 already present"
    return 0
  fi

  command -v apt-get >/dev/null 2>&1 || {
    echo "Expected Node 22.x, got $(node -v 2>/dev/null || echo missing), and apt-get is unavailable" >&2
    exit 1
  }
  command -v curl >/dev/null 2>&1 || {
    echo "curl is required to install Node 22 from NodeSource" >&2
    exit 1
  }

  local apt=(apt-get)
  local run=(bash)
  if [[ "${EUID}" -ne 0 ]]; then
    apt=(sudo apt-get)
    run=(sudo bash)
  fi

  log "installing Node 22 because current node is $(node -v 2>/dev/null || echo missing)"
  curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource-node22.sh
  "${run[@]}" /tmp/nodesource-node22.sh
  "${apt[@]}" install -y nodejs
  if [[ -x /usr/bin/node ]] && [[ "$(/usr/bin/node -p "process.versions.node.split('.')[0]")" == "22" ]]; then
    export PATH="/usr/bin:${PATH}"
  fi
  hash -r

  major="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "${major}" != "22" ]]; then
    echo "Expected Node 22.x after install, got $(node -v)" >&2
    exit 1
  fi
}

write_api_env() {
  local target="${API_DIR}/environment/env.localhero"
  if [[ -f "${target}" ]]; then
    log "API localhero env already exists; leaving it untouched"
    return 0
  fi

  cp "${API_DIR}/environment/env.localhero.example" "${target}"
  chmod 600 "${target}"
  log "created API localhero env from example"
}

write_admin_env() {
  local target="${ADMIN_DIR}/.env.local"
  if [[ -f "${target}" ]]; then
    if ! grep -q '^NEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN=' "${target}"; then
      printf '\nNEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN=LOCAL_ADMIN_AUTHORIZATION_TOKEN_LOCAL_ONLY\n' >> "${target}"
      log "added local-only admin token to admin .env.local"
    else
      log "admin .env.local already exists; leaving it untouched"
    fi
    return 0
  fi

  cat > "${target}" <<EOF
NEXT_PUBLIC_API_ENDPOINT=http://127.0.0.1:${API_PORT}/api/v2
NEXT_PUBLIC_IMG_ENDPOINT=http://127.0.0.1:${API_PORT}
NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN
NEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN=LOCAL_ADMIN_AUTHORIZATION_TOKEN_LOCAL_ONLY
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true
EOF
  chmod 600 "${target}"
  log "created admin .env.local for localhero API"
}

ensure_req_res_encoder_keys() {
  local source="${API_DIR}/private/req-res-encoder/keys"
  local target="${WORK_ROOT}/private/req-res-encoder/keys"

  [[ -f "${source}/test.public.pub" && -f "${source}/test.private.pkcs8" ]] || {
    echo "Missing localhero req-res encoder test keys in ${source}" >&2
    exit 1
  }

  mkdir -p "${target}"
  cp "${source}/test.public.pub" "${target}/test.public.pub"
  cp "${source}/test.private.pkcs8" "${target}/test.private.pkcs8"
  chmod 644 "${target}/test.public.pub"
  chmod 600 "${target}/test.private.pkcs8"
  log "prepared localhero req-res encoder test keys"
}

start_api() {
  log "starting localhero database"
  (cd "${API_DIR}" && npm run db:hero-local:start)

  log "bootstrapping localhero database"
  (cd "${API_DIR}" && npm run db:hero-local:bootstrap)

  log "starting API on ${API_PORT}"
  (cd "${API_DIR}" && setsid npm run dev:localhero >"${OUT_DIR}/api.log" 2>&1 </dev/null & echo $! >"${OUT_DIR}/api.pid")
  wait_for_tcp "API" "${API_PORT}" 90
}

start_admin() {
  log "starting admin on ${ADMIN_PORT}"
  (
    cd "${ADMIN_DIR}"
    setsid env \
      NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=true \
      WATCHPACK_POLLING=true \
      CHOKIDAR_USEPOLLING=true \
      npm run dev -- --hostname 0.0.0.0 -p "${ADMIN_PORT}" >"${OUT_DIR}/admin.log" 2>&1 </dev/null &
    echo $! >"${OUT_DIR}/admin.pid"
  )
  wait_for_tcp "Admin" "${ADMIN_PORT}" 120
}

main() {
  require_dir "${API_DIR}"
  require_dir "${ADMIN_DIR}"

  ensure_node22
  ensure_system_tools
  write_api_env
  write_admin_env
  ensure_req_res_encoder_keys
  install_deps "${API_DIR}" "API"
  install_deps "${ADMIN_DIR}" "admin"
  start_api
  start_admin

  printf '%s\n' "${READY_MARKER}"
}

main "$@"
