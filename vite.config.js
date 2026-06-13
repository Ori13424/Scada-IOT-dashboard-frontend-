import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['jointjs'],
  },
  build: {
    commonjsOptions: {
      include: [/jointjs/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
