import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../out/preload')

mkdirSync(outDir, { recursive: true })

await build({
  entryPoints: [resolve(__dirname, '../src/preload/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: resolve(outDir, 'index.js'),
  format: 'cjs',
  external: ['electron'],
  sourcemap: true
})

// Block parent node_modules resolution
writeFileSync(
  resolve(outDir, 'package.json'),
  JSON.stringify({ name: 'teacher-widget-preload', version: '1.0.0', private: true }),
  'utf-8'
)
mkdirSync(resolve(outDir, 'node_modules'), { recursive: true })

console.log('[preload] built successfully')
