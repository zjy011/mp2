import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repo name so assets resolve at https://zjy011.github.io/mp2/
  base: '/mp2/',
})
