import antfu from '@antfu/eslint-config'

export default function createConfig(options, ...userConfigs) {
  return antfu({
    type: 'app',
    typescript: true,
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    ...options,
  }, ...userConfigs)
}
