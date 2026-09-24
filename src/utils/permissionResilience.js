const toString = value => (value == null ? '' : String(value))

const normalizeCode = value => toString(value).trim()

const getResponseBody = response => response?.data || {}

const hasCode = (value, expected) => normalizeCode(value) === String(expected)

const containsRolePermissionMessage = value => toString(value).toLowerCase().includes('role api permission not found')

const isLegacyMissingRoleApiPermission = response => {
  const body = getResponseBody(response)

  return (
    response?.status === 500 &&
    hasCode(body.code, 401) &&
    (containsRolePermissionMessage(body.data) ||
      containsRolePermissionMessage(body.message) ||
      containsRolePermissionMessage(body.error))
  )
}

const isPermissionDeniedResponse = response => {
  const body = getResponseBody(response)

  return response?.status === 403 || hasCode(body.code, 403) || isLegacyMissingRoleApiPermission(response)
}

const isExpiredCredentialResponse = response => {
  if (!response || isPermissionDeniedResponse(response)) return false

  const body = getResponseBody(response)

  return response.status === 401 || (!response.status && hasCode(body.code, 401))
}

const getDropdownLookupErrorMessage = (error, label = 'lookup') => {
  const payload = error?.data || error?.response?.data || {}
  const message = payload.message || payload.data || error?.message

  return message
    ? `${label} could not be loaded: ${message}`
    : `${label} could not be loaded. Please check API permissions and retry.`
}

const productHasVariants = product => {
  if (!product) return false
  if (Array.isArray(product.child_variants) && product.child_variants.length > 0) return true

  return Number(product.variant_count || 0) > 0
}

module.exports = {
  getDropdownLookupErrorMessage,
  isExpiredCredentialResponse,
  isLegacyMissingRoleApiPermission,
  isPermissionDeniedResponse,
  productHasVariants
}
