// @ts-check

import antfu from '@antfu/eslint-config'
import autoImports from 'eslint-plugin-auto-imports'
import { globalIgnores } from 'eslint/config'

export default antfu(
  {
    formatters: true,
  },
  {
    plugins: {
      'auto-imports': autoImports,
    },
    rules: {
      'auto-imports/no-unnecessary-import': 'error',
      'no-alert': 'off',
      'no-console': 'off',
    },
  },
  globalIgnores([
    'docs/vueuse/*.md',
    '**/api-examples.md',
    'MIGRATION_PLAN.md',
    '.unimport-items.json',
  ]),
)
