import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLibMode = mode === 'lib'
  
  return {
    plugins: [
      vue(),
      ...(isLibMode ? [dts({
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: ['src/**/__tests__/**'],
        outputDir: 'dist',
        staticImport: true,
        rollupTypes: true
      })] : [])
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    ...(isLibMode ? {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'InfobusVue',
          fileName: 'index'
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            }
          }
        }
      }
    } : {
      root: 'demo',
      build: {
        outDir: '../dist-demo'
      }
    }),
    test: {
      environment: 'jsdom',
      globals: true
    }
  }
})
