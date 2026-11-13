import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // Unlisted page, served at /whoami/
        whoami: resolve(import.meta.dirname, 'whoami/index.html'),
        datatracking: resolve(import.meta.dirname, 'datatracking/index.html'),
      },
    },
  },
});
