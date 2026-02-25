import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    // 👇 核心修复：添加这一行，允许所有公网域名访问
    allowedHosts: true,
  }
})