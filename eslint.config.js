// @ts-check

import antfu from '@antfu/eslint-config'
import { globalIgnores } from 'eslint/config'

export default antfu(
  {
    formatters: true,
    pnpm: true,
  },
  globalIgnores([
    '**/API-LIST.md',
  ]),
)
