import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // true または '0.0.0.0'
    port: 5173,       // お好みでポートを指定
    strictPort: false // ポートが使われていても別ポートに切り替え
  }
});
