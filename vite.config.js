import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    outDir: 'assets/unity', emptyOutDir: true,
    lib: { entry: 'src/main.js', formats: ['es'], fileName: () => 'world.js', cssFileName: 'style' },
    rollupOptions: { output: { chunkFileNames: '[name].js', assetFileNames: '[name][extname]' } },
    target: 'es2020', sourcemap: false
  }
});
