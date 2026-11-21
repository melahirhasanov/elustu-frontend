import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  optimizeDeps: {
    // maplibre-gl 5+ öz worker faylını import.meta.url ilə yükləyir; Vite-in ön-optimizasiyası bu yolu pozur
    exclude: ['maplibre-gl'],
  },
})
