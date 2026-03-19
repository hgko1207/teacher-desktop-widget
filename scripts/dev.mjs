import { spawn, execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// 1. Build main + preload
console.log('[dev] Building main process...')
execSync('node scripts/build-main.mjs', { cwd: root, stdio: 'inherit' })

console.log('[dev] Building preload...')
execSync('node scripts/build-preload.mjs', { cwd: root, stdio: 'inherit' })

// 2. Start Vite dev server for renderer
console.log('[dev] Starting Vite dev server...')
const vite = spawn('npx', ['vite', '--config', 'vite.config.ts'], {
  cwd: root,
  stdio: 'pipe',
  shell: true
})

let viteReady = false

function stripAnsi(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, '')
}

vite.stdout.on('data', (data) => {
  const text = data.toString()
  process.stdout.write(text)

  if (!viteReady) {
    const clean = stripAnsi(text)
    const match = clean.match(/http:\/\/localhost:\d+/)
    if (match) {
      viteReady = true
      const url = match[0]
      console.log(`\n[dev] Starting Electron with renderer URL: ${url}`)

      // 3. Start Electron
      const electron = spawn(
        'npx',
        ['electron', resolve(root, 'out/main/index.js')],
        {
          cwd: root,
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            ELECTRON_RENDERER_URL: url
          }
        }
      )

      electron.on('close', () => {
        vite.kill()
        process.exit()
      })
    }
  }
})

vite.stderr.on('data', (data) => {
  process.stderr.write(data)
})
