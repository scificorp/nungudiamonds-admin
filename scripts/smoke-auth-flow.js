const API_BASE = (process.env.ADMIN_API_BASE_URL || 'http://localhost:2511/api/v2').replace(/\/$/, '')
const USERNAME = process.env.LOCAL_HERO_ADMIN_USERNAME || 'local-admin@nungu.local'
const PASSWORD = process.env.LOCAL_HERO_ADMIN_PASSWORD || 'LocalheroAdmin!2026'
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN || 'PUBLIC_AUTHORIZATION_TOKEN'

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: options.token } : {}),
      ...(options.headers || {})
    }
  })
  const payload = await response.json().catch(() => ({}))

  return { response, payload }
}

function assertOk(label, response, payload) {
  if (!response.ok || !(payload.code === 200 || payload.code === '200')) {
    throw new Error(`${label} failed: HTTP ${response.status} ${JSON.stringify(payload)}`)
  }
}

async function main() {
  const badLogin = await requestJson('/login', {
    method: 'POST',
    body: JSON.stringify({ username: USERNAME, password: `${PASSWORD}-wrong` })
  })

  if (badLogin.response.ok && (badLogin.payload.code === 200 || badLogin.payload.code === '200')) {
    throw new Error('Invalid login unexpectedly succeeded')
  }

  const login = await requestJson('/login', {
    method: 'POST',
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  })
  assertOk('valid login', login.response, login.payload)

  const token = login.payload.data?.tokens?.token
  const refreshToken = login.payload.data?.tokens?.refreshToken
  const userDetail = login.payload.data?.user_detail

  if (!token || !refreshToken || !userDetail?.username) {
    throw new Error(`Login response missing token or user detail: ${JSON.stringify(login.payload)}`)
  }

  const dashboard = await requestJson('/dashboard', { token })
  assertOk('authenticated dashboard', dashboard.response, dashboard.payload)

  const cmsList = await requestJson('/staticPage?current_page=1&per_page_rows=2', { token })
  assertOk('authenticated CMS list', cmsList.response, cmsList.payload)

  const publicCmsList = await requestJson('/staticPage?current_page=1&per_page_rows=2', { token: PUBLIC_TOKEN })
  if (publicCmsList.response.ok && (publicCmsList.payload.code === 200 || publicCmsList.payload.code === '200')) {
    throw new Error('Public token unexpectedly accessed CMS admin list')
  }

  const refresh = await requestJson('/refresh-authorization-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  assertOk('refresh token', refresh.response, refresh.payload)

  console.log(JSON.stringify({
    ok: true,
    username: userDetail.username,
    userType: userDetail.user_type,
    idRole: login.payload.data?.id_role,
    dashboardChecked: true,
    cmsListChecked: true,
    publicCmsListRejected: publicCmsList.response.status,
    refreshChecked: true
  }, null, 2))
}

main().catch(error => {
  console.error(error.stack || error.message)
  process.exit(1)
})
