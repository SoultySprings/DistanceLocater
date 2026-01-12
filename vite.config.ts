import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/routing': {
        target: 'https://router.project-osrm.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/routing/, '/route/v1/driving')
      }
    }
  }
})
