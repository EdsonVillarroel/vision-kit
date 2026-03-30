import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  // Para GitHub Pages: descomentar y ajustar si se mantiene en /vision-2020/
  // base: '/vision-2020/',
});
