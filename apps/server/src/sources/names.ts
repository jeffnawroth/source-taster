// SPDX-License-Identifier: AGPL-3.0-or-later
export function projectDisplayName(value: string) {
  const parts = value.trim().split(/\s+/u);
  return {
    family: parts.pop()!,
    ...(parts.length ? { given: parts.join(" ") } : {}),
  };
}
