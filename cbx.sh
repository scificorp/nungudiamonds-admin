#!/usr/bin/env bash
set -euo pipefail

PROVIDER="${CRABBOX_PROVIDER:-daytona}"
SNAPSHOT="${DAYTONA_SNAPSHOT:-daytona-large}"
TTL="${CRABBOX_TTL:-45m}"
READY_MARKER="${READY_MARKER:-NUNGU STACK READY}"
API_PORT="${API_PORT:-2511}"
ADMIN_PORT="${ADMIN_PORT:-3000}"
LOCAL_ADMIN_PORT="${LOCAL_ADMIN_PORT:-3000}"
LOCAL_API_PORT="${LOCAL_API_PORT:-2511}"
API_ROOT="${API_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../tcctechapi-nungudiamonds-release" && pwd)}"

usage() {
  cat <<'EOF'
Usage: ./cbx.sh <command> [name]

Commands:
  doctor          Check local Crabbox/Daytona readiness.
  snapshot        Print the optional custom Daytona snapshot build command.
  sync-plan       Show what Crabbox would sync for the admin worktree.
  up <name>       Lease/sync a box, sync API sibling, and start localhero stack.
  status <name>   Show remote process and port status.
  logs <name>     Tail remote setup, API, and admin logs.
  smoke <name>    Run API/admin smoke checks inside the box.
  screenshot <name>
                  Capture a Chromium screenshot of the admin dashboard.
  tunnel <name>   Tunnel admin and API ports to localhost.
  down <name>     Stop the remote box and remove the local lease file.

No production data, deploys, or client contact happen from this wrapper.
EOF
}

name="${2:-nungu-admin}"
id_file=".cbx-${name}.id"

PROVIDER_ARGS=(--provider "$PROVIDER" --target linux)
if [[ "$PROVIDER" == "daytona" ]]; then
  PROVIDER_ARGS+=(--daytona-snapshot "$SNAPSHOT")
fi
LIFECYCLE_ARGS=("${PROVIDER_ARGS[@]}" --ttl "$TTL")

lease_id() {
  [[ -s "$id_file" ]] || {
    echo "No lease file for '${name}'. Run: ./cbx.sh up ${name}" >&2
    exit 1
  }
  cat "$id_file"
}

run_remote() {
  local id="$1"
  shift
  crabbox run "${PROVIDER_ARGS[@]}" --id "$id" --no-sync -- "$@"
}

ssh_command() {
  local id="$1"
  crabbox ssh --id "$id" --show-secret 2>/dev/null | tail -1
}

remote_admin_dir() {
  local id="$1"
  run_remote "$id" bash -lc 'printf "__PWD__%s\n" "$PWD"' | sed -n 's/^__PWD__//p' | tail -1
}

sync_api() {
  local id="$1"
  [[ -d "${API_ROOT}" ]] || {
    echo "[cbx] API root not found: ${API_ROOT}" >&2
    exit 1
  }

  local remote_admin remote_api
  local archive
  remote_admin="$(remote_admin_dir "$id")"
  [[ -n "${remote_admin}" ]] || {
    echo "[cbx] could not determine remote admin directory" >&2
    exit 1
  }
  remote_api="$(dirname "${remote_admin}")/tcctechapi-nungudiamonds-release"

  archive="crabbox-api-sync.tgz"
  trap 'rm -f "${archive}"' RETURN

  echo "[cbx] archiving API ${API_ROOT}"
  COPYFILE_DISABLE=1 tar --no-xattrs -czf "${archive}" \
    --exclude .git \
    --exclude .idea \
    --exclude node_modules \
    --exclude dist \
    --exclude build \
    --exclude output \
    --exclude coverage \
    --exclude '.local' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude 'environment/env.localhero' \
    --exclude 'environment/env.development' \
    --exclude 'environment/env.production' \
    --exclude 'environment/env.staging' \
    --exclude 'environment/env.nungu' \
    -C "${API_ROOT}" .

  echo "[cbx] syncing API archive through Crabbox workspace sync"
  crabbox run "${LIFECYCLE_ARGS[@]}" --id "$id" -- bash -lc \
    "rm -rf '${remote_api}' && mkdir -p '${remote_api}' && tar -xzf crabbox-api-sync.tgz -C '${remote_api}' && rm -f crabbox-api-sync.tgz"
}

wait_for_marker() {
  local id="$1"
  for _ in $(seq 1 120); do
    if run_remote "$id" bash -lc "grep -q '${READY_MARKER}' /tmp/nungu-crabbox-setup.log"; then
      echo "[cbx] ${READY_MARKER}"
      return 0
    fi
    if run_remote "$id" bash -lc 'grep -qiE "Expected Node|Missing required|npm ERR!|did not open port|Required PostgreSQL" /tmp/nungu-crabbox-setup.log'; then
      run_remote "$id" bash -lc 'tail -160 /tmp/nungu-crabbox-setup.log; echo "--- api ---"; tail -120 output/crabbox/api.log 2>/dev/null || true; echo "--- admin ---"; tail -120 output/crabbox/admin.log 2>/dev/null || true'
      exit 1
    fi
    sleep 10
  done
  run_remote "$id" bash -lc 'tail -160 /tmp/nungu-crabbox-setup.log; echo "--- api ---"; tail -120 output/crabbox/api.log 2>/dev/null || true; echo "--- admin ---"; tail -120 output/crabbox/admin.log 2>/dev/null || true'
  exit 1
}

cmd="${1:-}"
case "$cmd" in
  doctor)
    crabbox doctor "${PROVIDER_ARGS[@]}"
    ;;
  snapshot)
    cat <<EOF
daytona snapshot create nungu-node22-postgres \\
  --dockerfile devbox/Dockerfile \\
  --context devbox \\
  --cpu 4 \\
  --memory 8 \\
  --disk 10
EOF
    ;;
  sync-plan)
    crabbox sync-plan -limit "${SYNC_PLAN_LIMIT:-40}"
    ;;
  up)
    echo "[cbx] leasing ${PROVIDER} box '${name}'"
    out="$(crabbox warmup "${LIFECYCLE_ARGS[@]}" --slug "$name" 2>&1)"
    echo "$out"
    id="$(printf '%s\n' "$out" | grep -oE 'cbx_[0-9a-f]+' | head -1 || true)"
    [[ -n "$id" ]] || {
      echo "[cbx] could not parse lease id from warmup output" >&2
      exit 1
    }
    printf '%s\n' "$id" > "$id_file"

    echo "[cbx] waiting for remote shell"
    for _ in $(seq 1 40); do
      if run_remote "$id" true >/dev/null 2>&1; then
        break
      fi
      sleep 3
    done

    sync_api "$id"

    echo "[cbx] starting Nungu setup"
    crabbox run "${LIFECYCLE_ARGS[@]}" --id "$id" -- bash -lc \
      "setsid bash setup.sh >/tmp/nungu-crabbox-setup.log 2>&1 </dev/null & echo started"
    wait_for_marker "$id"
    echo "[cbx] remote admin: http://127.0.0.1:${ADMIN_PORT}/dashboard/"
    echo "[cbx] remote API: http://127.0.0.1:${API_PORT}/api/v2"
    ;;
  status)
    id="$(lease_id)"
    run_remote "$id" bash -lc "export PATH=/usr/bin:\$PATH; node -v; npm -v; lsof -nP -iTCP:${API_PORT} -sTCP:LISTEN || true; lsof -nP -iTCP:${ADMIN_PORT} -sTCP:LISTEN || true; ps -ef | grep -E '[n]ext dev|[n]odemon' || true"
    ;;
  logs)
    id="$(lease_id)"
    run_remote "$id" bash -lc 'echo "--- setup ---"; tail -160 /tmp/nungu-crabbox-setup.log 2>/dev/null || true; echo "--- api ---"; tail -160 output/crabbox/api.log 2>/dev/null || true; echo "--- admin ---"; tail -160 output/crabbox/admin.log 2>/dev/null || true'
    ;;
  smoke)
    id="$(lease_id)"
    run_remote "$id" bash -lc "set -euo pipefail; export PATH=/usr/bin:\$PATH; admin_dir=\"\$PWD\"; cd ../tcctechapi-nungudiamonds-release; npm run test:bespoke-local; cd \"\$admin_dir\"; ADMIN_API_BASE_URL='http://127.0.0.1:${API_PORT}/api/v2' NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN npm run smoke:routes; ADMIN_API_BASE_URL='http://127.0.0.1:${API_PORT}/api/v2' NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN npm run smoke:auth; ADMIN_API_BASE_URL='http://127.0.0.1:${API_PORT}/api/v2' ADMIN_API_AUTH_TOKEN=LOCAL_ADMIN_AUTHORIZATION_TOKEN_LOCAL_ONLY NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN npm run smoke:catalog; ADMIN_API_BASE_URL='http://127.0.0.1:${API_PORT}/api/v2' ADMIN_API_AUTH_TOKEN=LOCAL_ADMIN_AUTHORIZATION_TOKEN_LOCAL_ONLY NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN npm run smoke:cms"
    ;;
  screenshot)
    id="$(lease_id)"
    run_remote "$id" bash -lc "cd ../tcctechapi-nungudiamonds-release && node - <<'NODE'
const fs = require('fs');
const puppeteer = require('puppeteer');
const url = 'http://127.0.0.1:${ADMIN_PORT}/dashboard/';
const out = '/tmp/nungu-admin-dashboard.png';
(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForTimeout(5000);
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (/You are not authorized|Internal Server Error/.test(bodyText)) {
    throw new Error('Dashboard did not render successfully: ' + bodyText.slice(0, 160));
  }
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  const stat = fs.statSync(out);
  if (stat.size < 10000) throw new Error('Screenshot looked too small: ' + stat.size);
  console.log(out + ' ' + stat.size + ' bytes');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
NODE"
    mkdir -p output/crabbox
    ssh_cmd="$(ssh_command "$id")"
    [[ -n "$ssh_cmd" ]] || {
      echo "[cbx] no ssh command for $id" >&2
      exit 1
    }
    eval "$ssh_cmd 'cat /tmp/nungu-admin-dashboard.png'" > "output/crabbox/${name}-admin-dashboard.png"
    echo "[cbx] wrote output/crabbox/${name}-admin-dashboard.png"
    ;;
  tunnel)
    id="$(lease_id)"
    ssh_cmd="$(ssh_command "$id")"
    [[ -n "$ssh_cmd" ]] || {
      echo "[cbx] no ssh command for $id" >&2
      exit 1
    }
    echo "[cbx] admin: http://127.0.0.1:${LOCAL_ADMIN_PORT}/dashboard/"
    echo "[cbx] API: http://127.0.0.1:${LOCAL_API_PORT}/api/v2"
    eval "$ssh_cmd -N -L ${LOCAL_ADMIN_PORT}:127.0.0.1:${ADMIN_PORT} -L ${LOCAL_API_PORT}:127.0.0.1:${API_PORT}"
    ;;
  down)
    id="$(lease_id)"
    crabbox stop "${PROVIDER_ARGS[@]}" "$id"
    rm -f "$id_file"
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
