const API_BASE = (process.env.ADMIN_API_BASE_URL || 'http://localhost:2511/api/v2').replace(/\/$/, '')
const ADMIN_TOKEN =
  process.env.ADMIN_API_AUTH_TOKEN ||
  process.env.NEXT_PUBLIC_LOCAL_ADMIN_AUTHORIZATION_TOKEN ||
  'LOCAL_ADMIN_AUTHORIZATION_TOKEN_LOCAL_ONLY'
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN || 'PUBLIC_AUTHORIZATION_TOKEN'

function headers(token) {
  return {
    Authorization: token,
    'Content-Type': 'application/json'
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.token ? headers(options.token) : headers(ADMIN_TOKEN)),
      ...(options.headers || {})
    }
  })
  const payload = await response.json().catch(() => ({}))

  return { response, payload }
}

async function expectOk(path, options = {}) {
  const { response, payload } = await requestJson(path, options)
  if (!response.ok || !(payload.code === 200 || payload.code === '200')) {
    throw new Error(`${options.method || 'GET'} ${path} failed: HTTP ${response.status} ${JSON.stringify(payload)}`)
  }

  return payload
}

async function expectRejected(path, options = {}) {
  const { response, payload } = await requestJson(path, options)
  if (response.ok && (payload.code === 200 || payload.code === '200')) {
    throw new Error(`${options.method || 'GET'} ${path} unexpectedly succeeded with non-admin auth`)
  }

  return { status: response.status, payload }
}

async function main() {
  const suffix = Date.now()
  const slug = `cms-smoke-${suffix}`
  const created = {
    pageId: null,
    sectionIds: []
  }

  const pagePayload = {
    name: `CMS Smoke Page ${suffix}`,
    slug,
    content: 'CMS smoke body for authenticated static page flow.',
    meta_title: `CMS Smoke ${suffix}`,
    meta_description: 'Automated localhero CMS smoke page.',
    page_type: 'bespoke',
    hero_eyebrow: 'CMS Smoke',
    hero_title: 'Authenticated CMS Smoke',
    hero_subtitle: 'Proves static page CMS auth, sections, and public readback.',
    hero_media_desktop_url: 'https://example.com/desktop.jpg',
    hero_media_mobile_url: 'https://example.com/mobile.jpg',
    hero_cta_label: 'Begin',
    hero_cta_type: 'booking_modal',
    hero_cta_target: '',
    status: 'published'
  }

  try {
    const rejectedList = await expectRejected('/staticPage?current_page=1&per_page_rows=1', {
      token: PUBLIC_TOKEN
    })
    const rejectedCreate = await expectRejected('/staticPage/add', {
      method: 'POST',
      token: PUBLIC_TOKEN,
      body: JSON.stringify(pagePayload)
    })

    const createdPage = await expectOk('/staticPage/add', {
      method: 'POST',
      body: JSON.stringify(pagePayload)
    })
    created.pageId = createdPage.data?.id

    if (!created.pageId) {
      throw new Error(`CMS page creation succeeded without an id: ${JSON.stringify(createdPage)}`)
    }

    const page = await expectOk(`/staticPage/${created.pageId}`)
    if (page.data?.slug !== slug || page.data?.hero_title !== pagePayload.hero_title) {
      throw new Error(`CMS page readback mismatch: ${JSON.stringify(page.data)}`)
    }

    const firstSection = await expectOk(`/staticPage/${created.pageId}/sections`, {
      method: 'POST',
      body: JSON.stringify({
        section_type: 'process_steps',
        sort_order: 20,
        title: 'Second CMS smoke step',
        eyebrow: 'After',
        body: 'This section starts second and then gets reordered.',
        cta_label: 'View',
        cta_type: 'cms_page',
        cta_target: slug,
        settings_json: { smoke: true, order: 2 }
      })
    })
    const secondSection = await expectOk(`/staticPage/${created.pageId}/sections`, {
      method: 'POST',
      body: JSON.stringify({
        section_type: 'editorial_block',
        sort_order: 10,
        title: 'First CMS smoke step',
        eyebrow: 'Before',
        body: 'This section proves CMS section creation.',
        cta_label: 'Book',
        cta_type: 'booking_modal',
        cta_target: '',
        settings_json: { smoke: true, order: 1 }
      })
    })
    created.sectionIds.push(firstSection.data.id, secondSection.data.id)

    await expectOk(`/staticPage/sections/${firstSection.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        section_type: 'process_steps',
        sort_order: 10,
        title: 'First CMS smoke step updated',
        eyebrow: 'Updated',
        body: 'This section proves CMS section editing.',
        cta_label: 'View',
        cta_type: 'cms_page',
        cta_target: slug,
        settings_json: { smoke: true, edited: true }
      })
    })

    const reordered = await expectOk(`/staticPage/${created.pageId}/sections/reorder`, {
      method: 'PUT',
      body: JSON.stringify({
        sections: [
          { id: firstSection.data.id, sort_order: 10 },
          { id: secondSection.data.id, sort_order: 20 }
        ]
      })
    })

    const orderedIds = (reordered.data || []).map(section => section.id)
    if (orderedIds[0] !== firstSection.data.id || orderedIds[1] !== secondSection.data.id) {
      throw new Error(`CMS reorder readback mismatch: ${JSON.stringify(reordered.data)}`)
    }

    const publicPage = await expectOk('/staticPage/user', {
      method: 'POST',
      token: PUBLIC_TOKEN,
      body: JSON.stringify({ slug })
    })

    const publicSections = publicPage.data?.sections || []
    if (publicPage.data?.slug !== slug || publicSections.length < 2) {
      throw new Error(`CMS public readback mismatch: ${JSON.stringify(publicPage.data)}`)
    }

    console.log(JSON.stringify({
      ok: true,
      pageId: created.pageId,
      slug,
      sectionCount: publicSections.length,
      publicTokenRejectedForAdminList: rejectedList.status,
      publicTokenRejectedForAdminCreate: rejectedCreate.status
    }, null, 2))
  } finally {
    for (const sectionId of created.sectionIds) {
      await requestJson(`/staticPage/sections/${sectionId}`, {
        method: 'DELETE'
      }).catch(error => {
        console.warn(`Cleanup failed for CMS section ${sectionId}: ${error.message}`)
      })
    }

    if (created.pageId) {
      await requestJson('/staticPage/delete', {
        method: 'POST',
        body: JSON.stringify({ id: created.pageId })
      }).catch(error => {
        console.warn(`Cleanup failed for CMS page ${created.pageId}: ${error.message}`)
      })
    }
  }
}

main().catch(error => {
  console.error(error.stack || error.message)
  process.exit(1)
})
