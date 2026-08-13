export interface AppVariables {
  userId: string
  apiKey?: { id: string, keyPrefix: string } | null
}

export interface AppEnv {
  Variables: AppVariables
}
