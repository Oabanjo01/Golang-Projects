import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The Go API runs on :8080. Proxying keeps the browser on one origin in dev,
    // so the auth cookie is same-site and SameSite=Lax works locally.
    // See DESIGN.md §3.4 for why this stops being true once deployed.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
      },
    },
  },
})