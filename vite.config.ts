import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        'fast-deep-equal': 'fast-deep-equal/es6',
    },
},
})
