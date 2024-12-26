import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  optimizeDeps: {
    include: ['antd'],
  },
  resolve: {
    alias: {
      'antd/dist/antd.min.css': 'antd/dist/antd.css',
    },
  },
})
