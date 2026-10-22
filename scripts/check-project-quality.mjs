import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const sourceRoot = path.join(projectRoot, 'src')
const distRoot = path.join(projectRoot, 'dist')
const assetsRoot = path.join(distRoot, 'assets')

async function requireDirectory(relativePath) {
  const location = path.join(projectRoot, relativePath)
  assert.equal((await stat(location)).isDirectory(), true, `Expected directory: ${relativePath}`)
}

async function requireFile(relativePath) {
  const location = path.join(projectRoot, relativePath)
  assert.equal((await stat(location)).isFile(), true, `Expected file: ${relativePath}`)
}

async function readSource(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8')
}

function getAssetPath(relativeAssetPath) {
  const assetPath = path.resolve(distRoot, relativeAssetPath.replace(/^[/\\]/, ''))
  assert.ok(assetPath.startsWith(`${assetsRoot}${path.sep}`), `Unexpected build asset path: ${relativeAssetPath}`)
  return assetPath
}

async function gzipSize(relativeAssetPath) {
  const content = await readFile(getAssetPath(relativeAssetPath))
  return gzipSync(content).byteLength
}

const sourceDirectories = [
  'app',
  'components',
  'constants',
  'features',
  'localization',
  'mock',
  'pages',
  'store',
  'types',
  'utils',
]

for (const directory of sourceDirectories) {
  await requireDirectory(path.join('src', directory))
}

const entryFiles = [
  'src/main.tsx',
  'src/index.css',
  'src/app/router/router.tsx',
  'src/app/layouts/AppLayout.tsx',
  'src/components/ui/index.ts',
  'src/features/admin/index.ts',
  'src/features/requests/index.ts',
  'src/store/index.ts',
  'src/types/index.ts',
  'src/utils/index.ts',
]

for (const file of entryFiles) {
  await requireFile(file)
}

const featureDirectories = (await readdir(path.join(sourceRoot, 'features'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
for (const feature of featureDirectories) {
  await requireFile(path.join('src', 'features', feature.name, 'index.ts'))
}
console.log(`PASS project structure (${sourceDirectories.length} source areas, ${featureDirectories.length} feature modules)`)

const html = await readFile(path.join(distRoot, 'index.html'), 'utf8')
assert.match(html, /<meta[^>]+name="viewport"[^>]+width=device-width/i, 'The production page must set a responsive viewport')
const entryScript = html.match(/<script[^>]+src="(\/assets\/[^"]+\.js)"/i)?.[1]
assert.ok(entryScript, 'The production page must reference its JavaScript entry bundle')
const initialScripts = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/gi)].map((match) => match[1])
const styleSheet = html.match(/<link[^>]+rel="stylesheet"[^>]+href="(\/assets\/[^"]+\.css)"/i)?.[1]
assert.ok(styleSheet, 'The production page must reference its stylesheet')

const entryGzipBytes = await gzipSize(entryScript)
const initialJavaScriptGzipBytes = (
  await Promise.all([...new Set(initialScripts)].map(gzipSize))
).reduce((total, size) => total + size, 0)
const cssGzipBytes = await gzipSize(styleSheet)
const kibibyte = 1024

assert.ok(entryGzipBytes <= 140 * kibibyte, `Entry JavaScript is ${Math.ceil(entryGzipBytes / kibibyte)} KiB gzip (budget: 140 KiB)`)
assert.ok(initialJavaScriptGzipBytes <= 160 * kibibyte, `Initial JavaScript is ${Math.ceil(initialJavaScriptGzipBytes / kibibyte)} KiB gzip (budget: 160 KiB)`)
assert.ok(cssGzipBytes <= 20 * kibibyte, `Initial CSS is ${Math.ceil(cssGzipBytes / kibibyte)} KiB gzip (budget: 20 KiB)`)

const lazyScripts = (await readdir(assetsRoot))
  .filter((file) => file.endsWith('.js') && `/${path.posix.join('assets', file)}` !== entryScript)
for (const script of lazyScripts) {
  const size = await gzipSize(`/assets/${script}`)
  assert.ok(size <= 50 * kibibyte, `${script} is ${Math.ceil(size / kibibyte)} KiB gzip (lazy chunk budget: 50 KiB)`)
}
console.log(`PASS performance budgets (entry ${Math.ceil(entryGzipBytes / kibibyte)} KiB, initial JS ${Math.ceil(initialJavaScriptGzipBytes / kibibyte)} KiB, CSS ${Math.ceil(cssGzipBytes / kibibyte)} KiB gzip)`)

const [appLayout, mobileNav, mainContent, css] = await Promise.all([
  readSource('src/app/layouts/AppLayout.tsx'),
  readSource('src/app/layouts/MobileNav.tsx'),
  readSource('src/app/layouts/MainContent.tsx'),
  readFile(getAssetPath(styleSheet), 'utf8'),
])
const tablePrimitives = await readSource('src/components/tables/primitives.tsx')
for (const [source, requiredClass, file] of [
  [appLayout, 'hidden lg:flex', 'AppLayout'],
  [appLayout, 'lg:hidden', 'AppLayout'],
  [mobileNav, 'fixed inset-x-0 bottom-0', 'MobileNav'],
  [mobileNav, 'grid-cols-5', 'MobileNav'],
  [mobileNav, 'min-h-14', 'MobileNav'],
  [mainContent, 'min-w-0', 'MainContent'],
  [mainContent, 'sm:p-6', 'MainContent'],
  [mainContent, 'lg:pb-6', 'MainContent'],
  [tablePrimitives, 'relative w-full overflow-x-auto', 'DataTable'],
]) {
  assert.ok(source.includes(requiredClass), `${file} must retain responsive layout class "${requiredClass}"`)
}
for (const breakpoint of ['40rem', '48rem', '64rem']) {
  assert.ok(
    new RegExp(`@media\\s*\\(width\\s*>=\\s*${breakpoint.replace('.', '\\.')}\\)`).test(css),
    `Production CSS must include the ${breakpoint} responsive breakpoint`,
  )
}
console.log('PASS responsive layout contract (mobile navigation, safe table overflow, and 640/768/1024px CSS breakpoints)')
