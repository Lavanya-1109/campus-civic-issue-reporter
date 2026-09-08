import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths -- this app is built into react/dist/ and served
  // as part of the larger front-end/ static site, not from the domain
  // root, so root-absolute paths (Vite's default) would 404.
  base: './',
});