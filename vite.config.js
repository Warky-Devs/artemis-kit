import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';  // You'll need to install this


export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'fs',
        'path',
        'url',
        'chalk',
        'semver',
        'yargs',
        'yargs/helpers'
      ]
    },
    target: 'node16',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }, plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist'
    })
  ]
});