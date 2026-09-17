const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const checks = [
  {
    area: 'orders',
    file: 'src/pages/orders/orders-list/index.tsx',
    required: ['GET_ALL_ORDER', 'DataTable', 'orders-details']
  },
  {
    area: 'orders',
    file: 'src/pages/orders/orders-details/index.tsx',
    required: ['handleChangeOrderStatus', 'handleChangeDeliveryStatus', 'invoice']
  },
  {
    area: 'giftset-orders',
    file: 'src/pages/orders/giftset-orders-list/index.tsx',
    required: ['GET_ALL_GIFTSET', 'TccDataTable', 'giftset-order-details']
  },
  {
    area: 'giftset-orders',
    file: 'src/pages/orders/giftset-order-details/index.tsx',
    required: ['handleChangeOrderStatus', 'handleChangeDeliveryStatus', 'Saving delivery status']
  },
  {
    area: 'general-enquiries',
    file: 'src/pages/enquiries/general-enquiries/index.tsx',
    required: ['GET_ALL_GENERAL_ENQUIRIES', 'UPDATE_GENERAL_ENQUIRIES', 'Lead Status', 'follow-up notes']
  },
  {
    area: 'product-enquiries',
    file: 'src/pages/enquiries/product-enquiries/index.tsx',
    required: ['GET_ALL_PRODUCT_ENQUIRIES', 'UPDATE_PRODUCT_INQUIRIES', 'Lead Status', 'admin_comments']
  },
  {
    area: 'settings',
    file: 'src/pages/settings/currency-master/index.tsx',
    required: ['CURRENCY_GET_ALL', 'CURRENCY_STATUS', 'DeleteDataModel']
  },
  {
    area: 'settings',
    file: 'src/pages/settings/tax-master/index.tsx',
    required: ['TAX_GET_ALL', 'TAX_STATUS', 'DeleteDataModel']
  },
  {
    area: 'attributes',
    file: 'src/pages/attribute/clarity/index.tsx',
    required: ['CLARITY_GET_ALL', 'CLARITY_DELETE', 'DeleteDataModel']
  },
  {
    area: 'attributes',
    file: 'src/pages/attribute/diamond-shape/index.tsx',
    required: ['DIAMOND_SHAPE_GET_ALL', 'DIAMOND_SHAPE_DELETE', 'DeleteDataModel']
  },
  {
    area: 'roles',
    file: 'src/pages/roles-permission/roles/index.tsx',
    required: ['GET_ALL_ROLES', 'GET_ALL_MENU_ITEMS', 'UPDATE_ROLE_CONFIGRATION', 'Control admin roles and menu permissions']
  },
  {
    area: 'admin-users',
    file: 'src/pages/roles-permission/permission/index.tsx',
    required: ['GET_ALL_BUSINESS_USER', 'GET_ALL_ROLES', 'DELETE_BUSINESS_USER', 'DeleteDataModel', 'Adding a user here does grant admin access']
  }
]

const destructiveAreas = new Set(['settings', 'attributes'])

const read = relativePath => {
  const absolutePath = path.join(root, relativePath)
  if (!fs.existsSync(absolutePath)) {
    return { absolutePath, source: '' }
  }

  return { absolutePath, source: fs.readFileSync(absolutePath, 'utf8') }
}

const results = checks.map(check => {
  const { absolutePath, source } = read(check.file)
  const missingPatterns = check.required.filter(pattern => !source.includes(pattern))
  const destructiveSkipped = destructiveAreas.has(check.area)

  return {
    area: check.area,
    file: check.file,
    exists: fs.existsSync(absolutePath),
    requiredPatterns: check.required,
    missingPatterns,
    destructiveMutationSkipped: destructiveSkipped,
    skipReason: destructiveSkipped
      ? 'Non-production QA data is required before create/edit/delete/status mutation proof.'
      : '',
    passed: fs.existsSync(absolutePath) && missingPatterns.length === 0
  }
})

const grouped = results.reduce((acc, item) => {
  acc[item.area] = acc[item.area] || { checked: 0, passed: 0 }
  acc[item.area].checked += 1
  if (item.passed) acc[item.area].passed += 1

  return acc
}, {})

const failed = results.filter(item => !item.passed)
const proof = {
  schema_version: 1,
  tool: 'scripts/audit-operations-workflows.js',
  generated_at: new Date().toISOString(),
  scope: 'operations workflow CRUD gates',
  safety: {
    productionWrites: false,
    databaseMutation: false,
    destructiveMutationSkipped: true,
    destructiveMutationSkipReason: 'QA environment with non-production data is required before destructive workflow proof.'
  },
  grouped,
  results,
  verdict: failed.length === 0 ? 'passed' : 'failed'
}

console.log(JSON.stringify(proof, null, 2))

if (failed.length > 0) {
  process.exit(1)
}
