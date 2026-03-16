import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project at /emotionsapp/
  base: command === 'build' ? '/emotionsapp/' : '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Don't watch the TF.js model dir (large .bin files) — avoids slow startup and HMR
  server: {
    port: 5173,
    strictPort: false,
    watch: {
      ignored: ['**/public/web_model/**'],
    },
  },

  // Pre-bundle these so the first dev run doesn't hang for minutes
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', 'motion', '@tensorflow/tfjs', '@mediapipe/tasks-vision'],
  },
}))
