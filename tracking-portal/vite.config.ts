import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure base path is root
  server: {
    port: 3010,
    host: true
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    copyPublicDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Ensure assets use absolute paths
        assetFileNames: 'assets/[name].[ext]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      }
    }
  }
})
