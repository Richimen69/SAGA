import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'url';

// Como usas "type": "module" en tu package.json, Node 22 necesita esto para entender __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // ¡La magia para que Docker y Windows se comuniquen!
  server: {
    host: true, 
    port: 5173,
    strictPort: true, 
    watch: {
      usePolling: true 
    }
  }
})