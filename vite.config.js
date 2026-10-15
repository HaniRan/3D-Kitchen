import { defineConfig } from 'vite';

// base './' agar hasil build dapat dibuka dari folder mana pun.
export default defineConfig({
  base: './',
  server: { open: true },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500 },
});
