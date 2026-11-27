/// <reference types="vitest" />

import path from 'node:path'
import process from 'node:process'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'
import { voisWebviewDebug } from 'vite-plugin-vois-webview-debug'

export default defineConfig(({ mode }) => {
  console.log('mode', mode)
  const env = loadEnv(mode, process.cwd(), '')
  console.log('env', env.VITE_APP_ID.split(''))
  const debugPreview = process.argv.includes('--debug')

  const proxy = {
    '/v1': {
      target: 'http://demo.weila.hk',
      timeout: 20 * 1000,
      // target: 'http://192.168.0.125:8088',
      changeOrigin: true,
      secure: false,
    },
    '/v2': {
      // target: 'https://demo.weila.hk',
      // target: 'https://voiswork.com',
      target: 'https://api.voischat.cn',
      timeout: 20 * 1000,
      // target: 'http://192.168.0.125:8090',
      changeOrigin: true,
      secure: false,
    },
  }

  return {
    base: './',

    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'src')}/`,
      },
    },

    server: {
      cors: true,
      proxy,
    },

    preview: {
      host: true,
      proxy,
    },

    plugins: [
      voisWebviewDebug({ preview: debugPreview }),

      // https://github.com/posva/unplugin-vue-router
      VueRouter(),

      VueMacros({
        defineOptions: false,
        defineModels: false,
        plugins: {
          vue: Vue({
            script: {
              propsDestructure: true,
              defineModel: true,
            },
          }),
        },
      }),

      // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
      VueI18n({
        include: [path.resolve(__dirname, './src/locales/**')],
      }),

      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
          VueRouterAutoImports,
          {
          // add any other imports you were relying on
            'vue-router/auto': ['useLink'],
            'vue-i18n': ['useI18n'],
          },
        ],
        dts: true,
        dirs: [
          './src/composables',
          './src/queries',
          './src/utils',
          './src/shared',
        ],
        vueTemplate: true,
      }),

      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
      }),
    ],

    // https://github.com/vitest-dev/vitest
    test: {
      environment: 'jsdom',
    },
  }
})
