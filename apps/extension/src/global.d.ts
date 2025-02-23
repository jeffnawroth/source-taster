declare const __DEV__: boolean
/** Extension name, defined in packageJson.name */
declare const __NAME__: string

declare const __APP_VERSION__: string

declare module '*.vue' {
  const component: any
  export default component
}
