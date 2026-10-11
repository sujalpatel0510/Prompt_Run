import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // Split large vendor libraries into their own long-cacheable chunks so the
    // app shell can be re-downloaded cheaply on future deploys.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor'
            }
          }
          return undefined
        },
      },
    },
  },
})
