import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separar vendor estable del código de la app: mejora el cacheo entre
        // deploys (React/router rara vez cambian) y reduce el chunk inicial.
        // recharts solo lo usa la ruta de métricas (ya lazy) → su propio chunk.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
