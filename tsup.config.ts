import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.jsx'],
    format: ['esm', 'cjs'],
    loader: {
      '.glb': 'file',
    },
    publicDir: 'assets'
  })
  