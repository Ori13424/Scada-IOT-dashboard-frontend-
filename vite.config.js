import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // JointJS is a UMD/CJS library — pre-bundle it in dev so esbuild converts it to ESM
  optimizeDeps: {
    include: ['jointjs'],
  },

  build: {
    commonjsOptions: {
      // Process JointJS through the CJS plugin during production build
      include: [/jointjs/, /node_modules/],
      // JointJS uses a UMD factory wrapper — this tells Rollup to treat
      // the frozen namespace as a mutable interop object, which fixes
      // "Cannot add property X, object is not extensible" at runtime
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto',
    },
  },
})
