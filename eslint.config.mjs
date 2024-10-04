import antfu from '@antfu/eslint-config'

export default antfu({
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
