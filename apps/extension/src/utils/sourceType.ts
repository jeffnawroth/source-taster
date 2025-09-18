export function translateSourceType(translate: (key: string, ...args: any[]) => string, type?: string | null): string | null {
  if (!type)
    return null

  const translationKey = `source-type-${type}`
  const translated = translate(translationKey)

  return translated !== translationKey ? translated : type
}
