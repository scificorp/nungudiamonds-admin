const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const navigationFile = path.join(root, 'src/navigation/vertical/index.ts')
const pagesRoot = path.join(root, 'src/pages')

const source = fs.readFileSync(navigationFile, 'utf8')
const routeMatches = [...source.matchAll(/path:\s*['"]([^'"]+)['"]/g)]
const routes = [...new Set(routeMatches.map(match => match[1]).filter(route => route.startsWith('/')))]

const candidatesForRoute = route => {
  const routePath = route.replace(/^\/+/, '')

  return [
    path.join(pagesRoot, routePath, 'index.tsx'),
    path.join(pagesRoot, routePath, 'index.ts'),
    path.join(pagesRoot, `${routePath}.tsx`),
    path.join(pagesRoot, `${routePath}.ts`)
  ]
}

const missing = routes.filter(route => !candidatesForRoute(route).some(candidate => fs.existsSync(candidate)))

if (missing.length > 0) {
  console.error('Missing page files for navigation routes:')
  for (const route of missing) {
    console.error(`- ${route}`)
  }
  process.exit(1)
}

console.log(`Navigation route smoke check passed for ${routes.length} routes.`)
