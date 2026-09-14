import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes the built files use relative paths, so the site works
// on GitHub Pages (https://<user>.github.io/<repo>/) without extra config.
export default defineConfig({
  plugins: [react()],
  base: './',
});
