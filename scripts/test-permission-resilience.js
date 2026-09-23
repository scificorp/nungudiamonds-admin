#!/usr/bin/env node
const assert = require('node:assert/strict')
const {
  getDropdownLookupErrorMessage,
  isExpiredCredentialResponse,
  isPermissionDeniedResponse,
  productHasVariants
} = require('../src/utils/permissionResilience')

assert.equal(
  isPermissionDeniedResponse({ status: 500, data: { code: 401, data: 'Role API permission not found!' } }),
  true,
  'legacy role-permission failures are permission denials, not expired credentials'
)
assert.equal(
  isExpiredCredentialResponse({ status: 500, data: { code: 401, data: 'Role API permission not found!' } }),
  false,
  'legacy role-permission failures must not clear valid admin sessions'
)
assert.equal(isPermissionDeniedResponse({ status: 403, data: { code: 403 } }), true)
assert.equal(isExpiredCredentialResponse({ status: 401, data: { code: 401 } }), true)

assert.match(
  getDropdownLookupErrorMessage({ data: { message: 'Role API permission not found!' } }, 'Diamond group details'),
  /Diamond group details could not be loaded: Role API permission not found!/
)

assert.equal(productHasVariants({ id: 1, is_parent: '1', variant_count: 2, child_variants: [] }), true)
assert.equal(productHasVariants({ id: 1, is_parent: '1', variant_count: 0, child_variants: [] }), false)
assert.equal(productHasVariants({ id: 2, child_variants: [{ id: 3 }] }), true)

console.log('permission resilience tests passed')
