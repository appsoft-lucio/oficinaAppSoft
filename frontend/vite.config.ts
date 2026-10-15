import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'version-service-worker',
    apply: 'build',
    async writeBundle(options) {
      // Change the worker on every release so installed apps detect new code.
      const workerPath = resolve(options.dir ?? 'dist', 'sw.js')
      const source = await readFile(workerPath, 'utf8')
      await writeFile(workerPath, source.replace('oficina-appsoft-v2', `oficina-appsoft-${Date.now()}`))
    },
  }],
})
