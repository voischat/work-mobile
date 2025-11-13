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
    '**/API-LIST.md',
  ]),
)
