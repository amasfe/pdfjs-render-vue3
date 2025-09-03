import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      vue(),
      vueDevTools(),
      // 只在套件建置模式下啟用 dts 插件
      isLib &&
        dts({
          insertTypesEntry: true,
          rollupTypes: true,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'PdfJsRenderVue3',
            fileName: (format) => `pdfjs-render-vue3.${format}.js`,
            formats: ['es', 'umd'],
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              globals: {
                vue: 'Vue',
              },
            },
          },
          // 確保 CSS 被提取
          cssCodeSplit: false,
        }
      : undefined,
  }
})
