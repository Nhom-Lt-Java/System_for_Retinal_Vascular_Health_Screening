import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Gửi đến Backend
        changeOrigin: true,
        secure: false,
        // DÒNG QUAN TRỌNG NHẤT: Tự động xóa chữ /api đi trước khi gửi
        rewrite: (path) => path.replace(/^\/api/, '') 
      },
      // Thêm cái này để dự phòng nếu code gọi thẳng /auth
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})