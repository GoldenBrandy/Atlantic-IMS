import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    // Permite que el servidor de desarrollo acepte peticiones que llegan a
    // traves de un tunel de cloudflared (dominio *.trycloudflare.com), para
    // poder compartir el proyecto local sin tener que desplegarlo.
    allowedHosts: ['.trycloudflare.com'],
  },
})