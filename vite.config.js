import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        collections: resolve(__dirname, 'store/collections.html'),
        support: resolve(__dirname, 'company/support.html'),
        login: resolve(__dirname, 'authentication/login.html'),
        register: resolve(__dirname, 'authentication/register.html'),
        profile: resolve(__dirname, 'authentication/profile.html'),
      },
    },
  },
});
