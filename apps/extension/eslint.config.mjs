import createConfig from '@source-taster/eslint-config/create-config'

export default createConfig({
  vue: {
    overrides: {
      'vue/max-attributes-per-line': 'error',
      'vue/v-bind-style': ['error', 'shorthand', {
        sameNameShorthand: 'always',
      }],
    },
  },
  ignores: [
    'dist',
    'node_modules',
    'public',
  ],
})
