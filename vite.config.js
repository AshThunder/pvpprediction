import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rpc': {
        target: 'https://rpc-bradbury.genlayer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, '')
      }
    }
  }
})
