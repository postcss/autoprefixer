import loguxOxlintConfig from '@logux/oxc-configs/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [loguxOxlintConfig],
  rules: {
    'unicorn/no-array-sort': 'off',
    'unicorn/no-array-reverse': 'off',
    'typescript/no-base-to-string': 'off',
    'typescript/consistent-type-imports': 'off',
    'typescript/restrict-template-expressions': 'off',
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'new-cap': 'off'
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'typescript/consistent-type-imports': 'off',
        'typescript/no-unnecessary-type-parameters': 'off'
      }
    }
  ]
})
