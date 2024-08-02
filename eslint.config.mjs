import loguxConfig from '@logux/eslint-config'

export default [
  {
    ignores: ['coverage']
  },
  ...loguxConfig,
  {
    rules: {
      'n/prefer-node-protocol': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['bin/autoprefixer'],
    rules: {
      'n/global-require': 'off',
      'n/no-unsupported-features/es-syntax': 'off'
    }
  },
  {
    files: ['data/prefixes.js'],
    rules: {
      'import/order': 'off'
    }
  }
]
