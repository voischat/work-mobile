// @ts-check

import antfu from '@antfu/eslint-config'
import { globalIgnores } from 'eslint/config'
import autoImportCleanup from './eslint-plugin-auto-import-cleanup.mjs'

export default antfu(
  {
    formatters: true,
  },
  {
    plugins: {
      'auto-import-cleanup': autoImportCleanup,
    },
    rules: {
      'auto-import-cleanup/no-unnecessary-import': 'error',
      'no-alert': 'off',
      'no-console': 'off',
    },
  },
  globalIgnores([
    'docs/vueuse/*.md',
    '**/api-examples.md',
    'MIGRATION_PLAN.md',
    'auto-imports.json',
  ]),
)
