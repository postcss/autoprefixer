import loguxConfig from '@logux/eslint-config'

export default [
  {
    ignores: ['coverage']
  },
  ...loguxConfig,
  {
    rules: {
      'no-console': 'off',
      'node-import/prefer-node-protocol': 'off'
    }
  },
  {
    files: ['bin/autoprefixer'],
    rules: {
      'n/global-require': 'off'
    }
  },
  {
    files: ['data/prefixes.js'],
    rules: {
      'import/order': 'off'
    }
  }
]
