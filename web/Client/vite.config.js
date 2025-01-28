import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // allowedHosts: 'ycwogwccwcgk8s0k8s8gogg4.209.182.232.125.sslip.io'
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
})
