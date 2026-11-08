#!/usr/bin/env node
'use strict'

const { execFileSync } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const TASK = 'NUNGU-COLLECTIONS-FIX-001'
const DB_NAME = process.env.NUNGU_COLLECTIONS_DB_NAME || 'nungu_collections_fix_task'
const DB_PORT = process.env.NUNGU_COLLECTIONS_DB_PORT || '55439'
const PGDATA = process.env.NUNGU_COLLECTIONS_PGDATA || path.resolve(__dirname, '../../support/postgres/data')
const API_URL = process.env.NUNGU_COLLECTIONS_API_URL || 'http://127.0.0.1:2511/api/v2'
const API_ENV_FILE = process.env.NUNGU_COLLECTIONS_API_ENV_FILE || path.resolve(__dirname, '../../api/environment/env.localcollections')
const API_MIGRATION_UP = path.resolve(__dirname, '../../api/database-migrations/20261107-product-collections-active-unique.up.sql')

const schemaSql = `
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE, pass_hash VARCHAR(255), user_type SMALLINT,
  user_status SMALLINT DEFAULT 2, refresh_token VARCHAR(2048), pass_reset_token VARCHAR(2048),
  one_time_pass VARCHAR(255), resend_otp_count SMALLINT, last_login_date TIMESTAMP,
  firebase_device_token VARCHAR(255), is_active VARCHAR(1) DEFAULT '1',
  is_email_verified VARCHAR(1) DEFAULT '1', is_deleted VARCHAR(1) DEFAULT '0',
  approved_by INTEGER, approved_date TIMESTAMP, created_by INTEGER, created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER, modified_date TIMESTAMP, id_role INTEGER
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY, name VARCHAR(255), sku VARCHAR(255), sort_description VARCHAR(255),
  long_description TEXT, tag VARCHAR(255), setting_style_type VARCHAR(255), size VARCHAR(255), length VARCHAR(255),
  is_active VARCHAR(1) DEFAULT '1', is_deleted VARCHAR(1) DEFAULT '0', making_charge DOUBLE PRECISION,
  finding_charge DOUBLE PRECISION, other_charge DOUBLE PRECISION, created_by INTEGER, created_date TIMESTAMP,
  modified_by INTEGER, modified_date TIMESTAMP, is_featured VARCHAR(1), is_trending VARCHAR(1), slug VARCHAR(255),
  gender VARCHAR(255), is_parent VARCHAR(1) DEFAULT '1', parent_product_id INTEGER
);
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY, image_path VARCHAR(255), image_type SMALLINT, is_deleted VARCHAR(1), created_by INTEGER,
  created_date TIMESTAMP, modified_by INTEGER, modified_date TIMESTAMP
);
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL UNIQUE, description TEXT,
  excerpt TEXT, id_image INTEGER, id_banner_image INTEGER, is_active VARCHAR(1) DEFAULT '1',
  is_featured VARCHAR(1) DEFAULT '0', sort_order INTEGER DEFAULT 0, created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date TIMESTAMP, created_by INTEGER NOT NULL, modified_by INTEGER, is_deleted VARCHAR(1) DEFAULT '0'
);
CREATE TABLE IF NOT EXISTS product_collections (
  id SERIAL PRIMARY KEY, id_product INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  id_collection INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE, is_deleted VARCHAR(1) NOT NULL DEFAULT '0',
  created_by INTEGER NOT NULL, created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER, modified_date TIMESTAMP, CONSTRAINT unique_product_collection UNIQUE (id_product, id_collection, is_deleted)
);
CREATE INDEX IF NOT EXISTS idx_product_collections_active ON product_collections(id_product, id_collection) WHERE is_deleted = '0';
CREATE TABLE IF NOT EXISTS product_metal_options (
  id SERIAL PRIMARY KEY, id_product INTEGER, id_metal_group INTEGER, metal_weight NUMERIC, is_default VARCHAR(1),
  is_deleted VARCHAR(1), created_by INTEGER, created_date TIMESTAMP, modified_by INTEGER, modified_date TIMESTAMP,
  id_metal INTEGER, id_metal_tone VARCHAR(255), id_karat INTEGER
);
CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, category_name VARCHAR(255));
CREATE TABLE IF NOT EXISTS product_categories (id SERIAL PRIMARY KEY, id_product INTEGER, id_category INTEGER, is_deleted VARCHAR(1));
CREATE TABLE IF NOT EXISTS role_api_permissions (
  id SERIAL PRIMARY KEY, http_method SMALLINT, api_endpoint VARCHAR(255), is_active VARCHAR(1),
  id_menu_item INTEGER, id_action INTEGER
);
`

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function loopback(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  return host === 'localhost' || host.endsWith('.localhost') || host === '::1' || /^127(?:\.\d{1,3}){3}$/.test(host)
}

function validateApiTarget(value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw new Error('Preflight rejected malformed API target')
  }
  assert(parsed.protocol === 'http:' && loopback(parsed.hostname), 'Preflight rejected non-loopback API target')
  assert(!parsed.username && !parsed.password && !parsed.search && !parsed.hash, 'Preflight rejected API URL credentials/query/fragment')
  assert(parsed.port === '2511' && parsed.pathname.replace(/\/$/, '') === '/api/v2', 'Preflight rejected unexpected API port/path')
  return parsed
}

function preflight() {
  // This must stay before filesystem, PostgreSQL, or API calls: invalid targets cause no request.
  const api = validateApiTarget(API_URL)
  assert(DB_NAME === 'nungu_collections_fix_task' && DB_PORT === '55439', 'Preflight rejected unexpected synthetic database target')
  assert(path.resolve(PGDATA) === path.resolve(__dirname, '../../support/postgres/data'), 'Preflight rejected unexpected PostgreSQL data directory')
  assert(path.resolve(API_ENV_FILE) === path.resolve(__dirname, '../../api/environment/env.localcollections'), 'Preflight rejected unexpected API environment file')
  assert(path.resolve(API_MIGRATION_UP) === path.resolve(__dirname, '../../api/database-migrations/20261107-product-collections-active-unique.up.sql'), 'Preflight rejected unexpected API migration')
  return api
}

function selfTest() {
  const rejected = [
    'https://api.nungudiamonds.co.za/api/v2',
    'http://192.168.1.20:2511/api/v2',
    'http://127.0.0.1:2512/api/v2',
    'http://127.0.0.1:2511/api/v2?next=https://example.com'
  ]
  for (const target of rejected) {
    let threw = false
    try { validateApiTarget(target) } catch { threw = true }
    assert(threw, 'Preflight self-test accepted a forbidden target')
  }
  validateApiTarget('http://127.0.0.1:2511/api/v2')
  console.log('PASS preflight: remote, LAN, wrong-port, and query targets rejected before any request; loopback target accepted')
}

function assertIsolation() {
  assert(fs.existsSync(path.join(PGDATA, 'PG_VERSION')), 'Isolation check failed: task-owned PostgreSQL cluster is missing')
  execFileSync('pg_ctl', ['-D', PGDATA, 'status'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const apiEnv = Object.fromEntries(fs.readFileSync(API_ENV_FILE, 'utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => {
    const at = line.indexOf('=')
    return [line.slice(0, at), line.slice(at + 1)]
  }))
  assert(apiEnv.NODE_ENV === 'localcollections', 'Isolation check failed: API environment is not local')
  assert(apiEnv.DB_HOST === '127.0.0.1' && apiEnv.DB_PORT === DB_PORT && apiEnv.DB_NAME === DB_NAME, 'Isolation check failed: API database target mismatch')
  assert(apiEnv.MAIL_SUPPRESS_SEND === 'true', 'Isolation check failed: mail suppression is off')
  assert(apiEnv.MAIL_HOST === '127.0.0.1' && apiEnv.MAIL_PORT === '1', 'Isolation check failed: SMTP target is not a local sink')
  assert(apiEnv.S3_BUCKET_NAME === 'disabled-local-only' && apiEnv.S3_ACCESS_KEY_ID === 'disabled-local-only' && apiEnv.S3_SECRET_ACCESS_KEY === 'disabled-local-only', 'Isolation check failed: object-storage credentials are not inert')
  assert(apiEnv.PAYMENT_METHOD_SECRET_KEY === 'disabled-local-only', 'Isolation check failed: payment integration is not inert')
  assert(apiEnv.LOCAL_ADMIN_AUTHORIZATION_TOKEN === '', 'Isolation check failed: local auth bypass must be off')
  assert(apiEnv.SECURE_COMMUNICATION === 'false', 'Isolation check failed: unexpected encrypted-body mode')
  const dbInfo = psql("SELECT current_database() || '|' || host(inet_server_addr()) || '|' || inet_server_port()::text || '|' || current_setting('data_directory') || '|' || shobj_description(d.oid, 'pg_database') FROM pg_database AS d WHERE d.datname = current_database()")
  const [database, address, port, dataDirectory, comment] = dbInfo.split('|')
  assert(database === DB_NAME && address === '127.0.0.1' && port === DB_PORT, 'Isolation check failed: database is not the expected loopback target')
  assert(path.resolve(dataDirectory) === path.resolve(PGDATA), 'Isolation check failed: database files are outside the task workspace')
  assert(comment === `${TASK} synthetic only`, 'Isolation check failed: database marker is not task-owned synthetic data')
  const listenerInfo = execFileSync('lsof', ['-nP', `-iTCP:${DB_PORT}`, '-sTCP:LISTEN'], { encoding: 'utf8' })
  assert(listenerInfo.includes(`127.0.0.1:${DB_PORT}`) && !listenerInfo.includes(`*:${DB_PORT}`), 'Isolation check failed: database listener is not loopback-only')
  const apiListener = execFileSync('lsof', ['-nP', '-iTCP:2511', '-sTCP:LISTEN'], { encoding: 'utf8' })
  const apiLines = apiListener.trim().split(/\r?\n/).slice(1).filter(Boolean)
  assert(apiLines.length === 1 && apiListener.includes('127.0.0.1:2511') && !apiListener.includes('*:2511'), 'Isolation check failed: API listener is not unique and loopback-only')
  console.log('PASS isolation: disposable workspace PostgreSQL, both DB and API bound only to loopback, mail/storage/payment integrations inert')
}

function psql(sql, quiet = false) {
  const out = execFileSync('psql', [
    '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-h', '127.0.0.1', '-p', DB_PORT, '-U', 'nungu_test', '-d', DB_NAME,
    '-A', '-t', '-c', sql
  ], { input: undefined, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  return quiet ? out.trim() : out.trim()
}

function sqlSafe(value) {
  assert(typeof value === 'string' && /^[a-zA-Z0-9._@+$/ -]+$/.test(value), 'Unexpected synthetic SQL value')
  return `'${value}'`
}

async function apiRequest(path, method = 'GET', token, body) {
  const target = preflight()
  const url = new URL(path.replace(/^\//, ''), `${target.toString().replace(/\/$/, '')}/`)
  assert(loopback(url.hostname) && url.port === '2511', 'Request target changed after preflight')
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = token
  let response
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' })
  } catch {
    throw new Error(`API request failed at ${method} ${path}; local service was unreachable`)
  }
  let payload = null
  try { payload = await response.json() } catch {}
  return { status: response.status, payload }
}

function assertApiSuccess(result, label) {
  assert(result.status >= 200 && result.status < 300 && [200, '200'].includes(result.payload?.code), `${label} failed (HTTP ${result.status})`)
  return result.payload?.data ?? result.payload
}

function tokenFrom(payload, label) {
  const token = payload?.data?.tokens?.token || payload?.data?.data?.tokens?.token
  assert(typeof token === 'string' && token.length > 20, `${label} did not return a session token`)
  return token
}

async function createActor(email, password, roleId, runId, label) {
  const bcrypt = require(path.resolve(__dirname, '../../api/node_modules/bcrypt'))
  const passHash = bcrypt.hashSync(password, 10)
  const actorRows = psql(`INSERT INTO app_users (username, pass_hash, user_type, user_status, is_active, is_email_verified, is_deleted, id_role, created_date) VALUES (${sqlSafe(email)}, ${sqlSafe(passHash)}, 1, 2, '1', '1', '0', ${roleId}, CURRENT_TIMESTAMP) RETURNING id`)
  const actorId = Number(actorRows)
  assert(Number.isInteger(actorId) && actorId > 0, `${label} fixture was not seeded`)
  const login = await apiRequest('/login', 'POST', undefined, { username: email, password })
  const loginData = assertApiSuccess(login, `${label} login`)
  const token = tokenFrom({ data: loginData }, label)
  return { id: actorId, email, password, token, runId }
}

function findValue(value, key) {
  if (!value || typeof value !== 'object') return undefined
  if (Object.prototype.hasOwnProperty.call(value, key)) return value[key]
  for (const child of Object.values(value)) {
    const found = findValue(child, key)
    if (found !== undefined) return found
  }
  return undefined
}

function productMembership(payload) {
  const data = payload?.data ?? payload
  return data?.collections || data?.data?.collections || []
}

function collectionProductIds(payload) {
  const data = payload?.data ?? payload
  const collection = data?.collection || data?.data?.collection
  return Array.isArray(collection?.products) ? collection.products.map(product => Number(product.id)) : null
}

function activeCount(productId, collectionId) {
  const rows = psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '0'`)
  const count = Number(rows)
  assert(Number.isInteger(count), 'Could not verify active assignment count')
  return count
}

async function assertMembership(actor, productId, collectionId, expected, label) {
  const byProduct = await apiRequest(`/product-collection/by-product/${productId}`, 'GET', actor.token)
  const productData = assertApiSuccess(byProduct, `${label} by-product readback`)
  const collections = productMembership(productData)
  const hasCollection = collections.some(collection => Number(collection.id) === collectionId)
  assert(hasCollection === expected, `${label} by-product membership expected ${expected}, got ${hasCollection}`)
  assert(Number(productData.id) === productId, `${label} product readback did not retain the product`)

  const byCollection = await apiRequest(`/product-collection/by-collection/${collectionId}?current_page=1&per_page_rows=25`, 'GET', actor.token)
  const ids = collectionProductIds(assertApiSuccess(byCollection, `${label} by-collection readback`))
  assert(Array.isArray(ids), `${label} collection readback omitted product list`)
  assert(ids.includes(productId) === expected, `${label} by-collection membership expected ${expected}`)
}

const SMOKE_PASSWORD_POLICY = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&])[a-zA-Z0-9@$!%*#?&]+$/

function randomPassword() {
  return `Test${randomBytes(9).toString('hex')}9a!`
}

async function run() {
  const target = preflight()
  if (process.argv.includes('--self-test')) return selfTest()

  assertIsolation()
  psql(schemaSql)
  psql(fs.readFileSync(API_MIGRATION_UP, 'utf8'))
  console.log('PASS migration: active-edge uniqueness is installed idempotently')
  const runId = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`
  const adminEmail = `nungu-smoke-${runId}-admin@example.invalid`
  const deniedEmail = `nungu-smoke-${runId}-denied@example.invalid`
  const productSku = `SMOKE-${runId}`
  const collectionSlug = `smoke-collection-${runId}`
  const adminPassword = process.env.NUNGU_COLLECTIONS_ADMIN_PASSWORD || randomPassword()
  const deniedPassword = randomPassword()
  assert(SMOKE_PASSWORD_POLICY.test(adminPassword), 'Authorised smoke password does not meet API test requirements')
  assert(SMOKE_PASSWORD_POLICY.test(deniedPassword), 'Denied smoke password does not meet API test requirements')
  const browserProofSetup = process.argv.includes('--browser-proof-setup')
  let preserveFixtures = false
  let adminActor
  let deniedActor
  let productId
  let collectionId
  let primaryError

  try {
    adminActor = await createActor(adminEmail, adminPassword, 0, runId, 'authorised actor')
    deniedActor = await createActor(deniedEmail, deniedPassword, 999, runId, 'denied actor')

    const collectionRows = psql(`INSERT INTO collections (name, slug, description, excerpt, is_active, is_featured, sort_order, created_date, created_by, is_deleted) VALUES (${sqlSafe(`Synthetic collection ${runId}`)}, ${sqlSafe(collectionSlug)}, 'Task-owned local fixture', 'Synthetic only', '1', '0', 0, CURRENT_TIMESTAMP, ${adminActor.id}, '0') RETURNING id`)
    collectionId = Number(collectionRows)
    assert(Number.isInteger(collectionId) && collectionId > 0, 'Synthetic collection fixture was not seeded')
    const productRows = psql(`INSERT INTO products (name, sku, slug, sort_description, long_description, is_active, is_deleted, is_featured, is_trending, is_parent, created_by, created_date) VALUES (${sqlSafe(`Synthetic product ${runId}`)}, ${sqlSafe(productSku)}, ${sqlSafe(`synthetic-product-${runId}`)}, 'Task-owned local fixture', 'Synthetic only; disposable.', '1', '0', '0', '0', '1', ${adminActor.id}, CURRENT_TIMESTAMP) RETURNING id`)
    productId = Number(productRows)
    assert(Number.isInteger(productId) && productId > 0, 'Synthetic product fixture was not seeded')
    assert(psql(`SELECT COUNT(*) FROM products WHERE id = ${productId} AND sku = ${sqlSafe(productSku)} AND is_deleted = '0'`) === '1', 'Seeded product fixture missing')
    assert(psql(`SELECT COUNT(*) FROM collections WHERE id = ${collectionId} AND slug = ${sqlSafe(collectionSlug)} AND is_deleted = '0'`) === '1', 'Seeded collection fixture missing')
    psql(`INSERT INTO product_collections (id_product, id_collection, is_deleted, created_by, created_date) VALUES (${productId}, ${collectionId}, '1', ${adminActor.id}, CURRENT_TIMESTAMP)`)
    assert(psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '1'`) === '1', 'Pre-existing soft-deleted relationship fixture missing')
    console.log(`PASS fixtures: synthetic product ${productId}, collection ${collectionId}, authorised and denied local actors, pre-existing soft-deleted relationship verified`)

    const assign = await apiRequest('/product-collection/assign', 'POST', adminActor.token, { collection_id: collectionId, product_ids: [productId] })
    assertApiSuccess(assign, 'first assignment')
    assert(findValue(assign.payload, 'assignments_created') === 1, 'First assignment did not report exactly one changed relationship')
    assert(activeCount(productId, collectionId) === 1, 'First assignment did not create exactly one active relationship')
    assert(psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '1'`) === '0', 'First assignment did not reactivate the pre-existing tombstone')
    await assertMembership(adminActor, productId, collectionId, true, 'first full readback')
    console.log('PASS cycle 1 assign: by-product and by-collection readbacks contain membership')
    if (browserProofSetup) {
      preserveFixtures = true
      console.log(`PASS browser fixture setup: product=${productId}, collection=${collectionId}, admin=${adminEmail}; local fixture retained for authenticated UI proof`)
      return
    }
    const remove = await apiRequest('/product-collection/remove', 'POST', adminActor.token, { collection_id: collectionId, product_ids: [productId] })
    assertApiSuccess(remove, 'first removal')
    assert(findValue(remove.payload, 'removals_completed') === 1, `First removal did not report exactly one changed relationship (HTTP ${remove.status}, completed=${findValue(remove.payload, 'removals_completed')}, errors=${Array.isArray(findValue(remove.payload, 'errors')) ? findValue(remove.payload, 'errors').length : 0})`)
    assert(activeCount(productId, collectionId) === 0, 'First removal left an active relationship')
    assert(psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '1'`) === '1', 'First removal should retain one soft-deleted relationship')
    await assertMembership(adminActor, productId, collectionId, false, 'first removal readback')
    assert(psql(`SELECT COUNT(*) FROM products WHERE id = ${productId} AND is_deleted = '0'`) === '1', 'Product was deleted by relationship removal')
    console.log('PASS cycle 1 remove: membership absent; product remains')

    const denied = await apiRequest('/product-collection/assign', 'POST', deniedActor.token, { collection_id: collectionId, product_ids: [productId] })
    assert(denied.status === 403, `Denied actor expected HTTP 403, got ${denied.status}`)
    assert(activeCount(productId, collectionId) === 0, 'Denied actor mutated membership')
    console.log(`PASS denied actor: HTTP ${denied.status}; membership unchanged`)

    const reassign = await apiRequest('/product-collection/assign', 'POST', adminActor.token, { collection_id: collectionId, product_ids: [productId] })
    assertApiSuccess(reassign, 'second assignment')
    assert(findValue(reassign.payload, 'assignments_created') === 1, 'Second assignment did not report exactly one changed relationship')
    assert(activeCount(productId, collectionId) === 1, 'Second assignment created duplicate active rows')
    assert(psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '1'`) === '0', 'Second assignment did not reuse the existing tombstone')
    await assertMembership(adminActor, productId, collectionId, true, 'second full readback')
    const removeAgain = await apiRequest('/product-collection/remove', 'POST', adminActor.token, { collection_id: collectionId, product_ids: [productId] })
    assertApiSuccess(removeAgain, 'second removal')
    assert(findValue(removeAgain.payload, 'removals_completed') === 1, `Second removal did not report exactly one changed relationship (HTTP ${removeAgain.status}, completed=${findValue(removeAgain.payload, 'removals_completed')})`)
    assert(activeCount(productId, collectionId) === 0, `Second removal left ${activeCount(productId, collectionId)} active relationship(s)`)
    assert(psql(`SELECT COUNT(*) FROM product_collections WHERE id_product = ${productId} AND id_collection = ${collectionId} AND is_deleted = '1'`) === '1', 'Second removal created duplicate tombstones')
    await assertMembership(adminActor, productId, collectionId, false, 'second removal readback')
    assert(psql(`SELECT COUNT(*) FROM products WHERE id = ${productId} AND is_deleted = '0'`) === '1', 'Product missing after second removal')
    console.log('PASS cycle 2 reassign/remove: no duplicate active row; product retained')

  } catch (error) {
    primaryError = error
  } finally {
    if (preserveFixtures && !primaryError) return
    const cleanupErrors = []
    if (adminActor && productId && collectionId) {
      try {
        const result = await apiRequest('/product-collection/remove', 'POST', adminActor.token, { collection_id: collectionId, product_ids: [productId] })
        if (result.status < 200 || result.status >= 300) cleanupErrors.push(`relationship cleanup API HTTP ${result.status}`)
      } catch (error) { cleanupErrors.push(`relationship cleanup API failed: ${error.message}`) }
    }
    try {
      const cleanupSql = `
        DELETE FROM product_collections WHERE id_product IN (SELECT id FROM products WHERE sku = ${sqlSafe(productSku)}) OR id_collection IN (SELECT id FROM collections WHERE slug = ${sqlSafe(collectionSlug)});
        DELETE FROM products WHERE sku = ${sqlSafe(productSku)};
        DELETE FROM collections WHERE slug = ${sqlSafe(collectionSlug)};
        DELETE FROM app_users WHERE username IN (${sqlSafe(adminEmail)}, ${sqlSafe(deniedEmail)});
        SELECT (SELECT COUNT(*) FROM products WHERE sku = ${sqlSafe(productSku)}) +
               (SELECT COUNT(*) FROM collections WHERE slug = ${sqlSafe(collectionSlug)}) +
               (SELECT COUNT(*) FROM app_users WHERE username IN (${sqlSafe(adminEmail)}, ${sqlSafe(deniedEmail)}));
      `
      const remaining = psql(cleanupSql).split('\n').at(-1)
      assert(remaining === '0', 'Task fixture cleanup left rows behind')
      console.log('PASS cleanup: task-owned relationships, product, collection, and actors removed')
    } catch (error) { cleanupErrors.push(`database cleanup failed: ${error.message}`) }
    if (cleanupErrors.length) {
      console.error(`FAIL cleanup: ${cleanupErrors.join('; ')}`)
      process.exitCode = 1
    }
  }
  if (primaryError) {
    console.error(`FAIL ${primaryError.message}`)
    process.exitCode = 1
  } else if (!process.exitCode) {
    console.log('PASS collections-local round trip')
  }
}

try {
  preflight()
  if (process.argv.includes('--self-test')) selfTest()
  else run().catch(error => {
    console.error(`FAIL ${error.message}`)
    process.exitCode = 1
  })
} catch (error) {
  console.error(`FAIL ${error.message}`)
  process.exitCode = 1
}
