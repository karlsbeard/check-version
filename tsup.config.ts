import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vue: 'src/vue.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['vue', '@rsbuild/core'],
  splitting: false,
})
