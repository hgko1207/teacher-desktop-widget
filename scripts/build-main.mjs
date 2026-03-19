import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../out/main')

mkdirSync(outDir, { recursive: true })

// Build main process
await build({
  entryPoints: [resolve(__dirname, '../src/main/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: resolve(outDir, 'index.js'),
  format: 'cjs',
  external: ['electron'],
  sourcemap: true,
  define: {
    'import.meta.url': 'undefined'
  }
})

// Create a package.json in out/main to prevent node_modules/electron resolution
// This forces require("electron") to use Electron's built-in module
writeFileSync(
  resolve(outDir, 'package.json'),
  JSON.stringify({ name: 'teacher-widget-main', version: '1.0.0', private: true }),
  'utf-8'
)

// Create empty node_modules to block parent resolution
mkdirSync(resolve(outDir, 'node_modules'), { recursive: true })

console.log('[main] built successfully')
