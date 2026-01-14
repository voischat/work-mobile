/// <reference types="vitest" />

import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },

  server: {
    cors: true,
    proxy: {
      '/v1': {
        target: 'http://demo.weila.hk',
        timeout: 20 * 1000,
        // target: 'http://192.168.0.125:8088',
        changeOrigin: true,
        secure: false,
      },
      '/v2': {
        target: 'https://voiswork.com',
        timeout: 20 * 1000,
        // target: 'http://192.168.0.125:8090',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [
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

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          'vue-router/auto': ['useLink'],
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
      dumpUnimportItems: './auto-imports.json',
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
})
