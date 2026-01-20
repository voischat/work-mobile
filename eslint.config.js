// @ts-check

import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
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
  // @ts-expect-error type error
  ...vueI18n.configs['flat/recommended'],
  {
    settings: {
      'vue-i18n': {
        localeDir: './src/locales/*.{json,yaml,yml}',
        messageSyntaxVersion: '^9.0.0',
      },
    },
  },
  globalIgnores([
    'docs/vueuse/*.md',
    '**/api-examples.md',
    'MIGRATION_PLAN.md',
    '.claude/**',
    'docs/i18n-setup.md',
  ]),
)
