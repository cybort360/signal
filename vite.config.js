import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Vercel serves from the domain root. (Use '/<repo>/' for gh-pages project pages.)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Phaser is ~1.3MB on its own and lives in its own chunk; raise the advisory
    // limit so its expected size doesn't surface as a build warning.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Keep Phaser and the Gemini SDK out of the main chunk so initial load
        // stays fast (CLAUDE.md Build Process). Vite 8 uses the Rolldown bundler,
        // which requires manualChunks as a function rather than the object form
        // shown in ARCHITECTURE.md — this is the functional equivalent.
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (id.includes('node_modules/@google/genai')) return 'gemini';
        },
      },
    },
  },
});
