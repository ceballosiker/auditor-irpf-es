import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the SPA works whether served from /, from
  // /auditor-irpf-es/ on GitHub Pages, or from any other sub-path.
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
