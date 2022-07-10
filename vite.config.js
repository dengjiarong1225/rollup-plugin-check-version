import { defineConfig } from 'vite'
import checkVersion from 'rollup-plugin-check-version';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/ 
export default defineConfig({
  plugins: [vue(), checkVersion({ duration: 10000 })]
})
