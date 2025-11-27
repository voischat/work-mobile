// @ts-check

import antfu from '@antfu/eslint-config'
import { globalIgnores } from 'eslint/config'

export default antfu(
  {
    formatters: true,
  },
  {
    rules: {
      'no-alert': 'off',
      'no-console': 'off',
    },
  },
  globalIgnores([
    'docs/vueuse/*.md',
    '**/api-examples.md',
  ]),
)
