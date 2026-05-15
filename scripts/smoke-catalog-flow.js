const API_BASE = (process.env.ADMIN_API_BASE_URL || 'http://localhost:2511/api/v2').replace(/\/$/, '')
const AUTH_TOKEN = process.env.ADMIN_API_AUTH_TOKEN || process.env.NEXT_PUBLIC_AUTHORIZATION_TOKEN || 'PUBLIC_AUTHORIZATION_TOKEN'
const KEEP_PRODUCT = process.env.KEEP_SMOKE_PRODUCT === 'true'

const jsonHeaders = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json'
}

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
)

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers || {})
    }
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !(payload.code === 200 || payload.code === '200')) {
    throw new Error(`${options.method || 'GET'} ${path} failed: HTTP ${response.status} ${JSON.stringify(payload)}`)
  }

  return payload
}

async function requestForm(path, formData) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: AUTH_TOKEN
    },
    body: formData
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || !(payload.code === 200 || payload.code === '200')) {
    throw new Error(`POST ${path} failed: HTTP ${response.status} ${JSON.stringify(payload)}`)
  }

  return payload
}

function firstActiveCategory(categories = []) {
  return categories.find(category => category.parent_id === null || Number(category.parent_id) === 0) || categories[0]
}

async function main() {
  const created = {
    productId: null,
    collectionId: null
  }

  try {
    const dropdowns = await requestJson('/add-product/dropDown/list')
    const category = firstActiveCategory(dropdowns.data?.categoryList || [])
    const metalTone = (dropdowns.data?.metal_tone || [])[0]

    if (!category?.id) {
      throw new Error('No category found in add-product dropdown data.')
    }
    if (!metalTone?.id) {
      throw new Error('No metal tone found in add-product dropdown data.')
    }

    const suffix = Date.now()
    const sku = `SMOKE-${suffix}`
    const productPayload = {
      id_product: 0,
      name: `Handover Smoke Product ${suffix}`,
      sku,
      sort_description: 'Automated handover smoke product for admin catalog verification.',
      long_description:
        'Automated handover smoke product created by the admin catalog smoke test to verify create, image, publish, featured, trending, and optional collection workflows.',
      making_charge: 0,
      finding_charge: 0,
      other_charge: 0,
      product_categories: [
        {
          id: 0,
          id_category: category.id,
          id_sub_category: null,
          id_sub_sub_category: null
        }
      ],
      tag: []
    }

    const createdProduct = await requestJson('/product-basic-details', {
      method: 'POST',
      body: JSON.stringify(productPayload)
    })
    created.productId = typeof createdProduct.data === 'number'
      ? createdProduct.data
      : createdProduct.data?.id || createdProduct.data?.findProduct?.id

    if (!created.productId) {
      throw new Error(`Product creation succeeded without returning an id: ${JSON.stringify(createdProduct)}`)
    }

    await requestJson(`/product/${created.productId}`)

    const imageForm = new FormData()
    imageForm.append('id_product', String(created.productId))
    imageForm.append('id_metal_tone', String(metalTone.id))
    imageForm.append('image_type', '2')
    imageForm.append('images', new Blob([png1x1], { type: 'image/png' }), `${sku}.png`)
    await requestForm('/product-images', imageForm)

    await requestJson('/active-inactive-product', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_active: '0' })
    })
    await requestJson('/active-inactive-product', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_active: '1' })
    })
    await requestJson('/product/featured/status', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_featured: '1' })
    })
    await requestJson('/product/trending/status', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_trending: '1' })
    })

    const collections = await requestJson('/collection?current_page=1&per_page_rows=1')
    const collection = collections.data?.result?.[0]
    if (collection?.id) {
      created.collectionId = collection.id
      await requestJson('/product-collection/assign', {
        method: 'POST',
        body: JSON.stringify({ collection_id: created.collectionId, product_ids: [created.productId] })
      })
      await requestJson(`/product-collection/by-product/${created.productId}`)
      await requestJson('/product-collection/remove', {
        method: 'POST',
        body: JSON.stringify({ collection_id: created.collectionId, product_ids: [created.productId] })
      })
    }

    await requestJson('/product/featured/status', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_featured: '0' })
    })
    await requestJson('/product/trending/status', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_trending: '0' })
    })
    await requestJson('/active-inactive-product', {
      method: 'POST',
      body: JSON.stringify({ id_product: created.productId, is_active: '0' })
    })

    console.log(JSON.stringify({
      ok: true,
      productId: created.productId,
      sku,
      categoryId: category.id,
      metalToneId: metalTone.id,
      collectionChecked: Boolean(created.collectionId),
      cleanup: KEEP_PRODUCT ? 'kept' : 'deleted'
    }, null, 2))
  } finally {
    if (created.productId && !KEEP_PRODUCT) {
      await requestJson('/product', {
        method: 'POST',
        body: JSON.stringify({ id: created.productId })
      }).catch(error => {
        console.warn(`Cleanup failed for product ${created.productId}: ${error.message}`)
      })
    }
  }
}

main().catch(error => {
  console.error(error.stack || error.message)
  if (error.cause) {
    console.error('Cause:', error.cause)
  }
  process.exit(1)
})
