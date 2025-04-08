/**
 * Extracts valid ISSNs from a given text
 * @param text The text to extract ISSNs from
 * @returns An array of valid ISSNs found in the text
 */
export default function extractIssns(text: string): string[] {
  // ISSN pattern: 4 digits, optional hyphen, 3 digits, and a check digit (0-9 or X)
  const issnPattern = /\b\d{4}-?\d{3}[\dX]\b/g
  const matches = text.match(issnPattern) || []

  // Filter matches to only include valid ISSNs
  const validIssns = matches.filter(potentialIssn => issnVerify(potentialIssn))

  return validIssns
}

// https://github.com/NatLibFi/issn-verify-js
function issnVerify(input: string) {
  const reg = /^\d{4}-?\d{3}[\dX]$/
  let check
  const num: number = input.substring(0, input.length - 1)
    .replace(/-/, '')
    .split('')
    .reverse()
    .reduce((prv, cur, idx) => {
      const i = idx + 2
      return prv + (Number(cur) * i)
    }, 0)
    % 11

  if (input.length < 8) {
    input = pad(input)
  }

  if (!input.match(reg)) {
    return false
  }

  check = num === 0 ? 0 : 11 - num

  if (check === 10) {
    check = 'X'
  }

  return check === input.slice(-1)
}

function pad(inp: string): string {
  while (inp.length < 8) {
    inp = `0${inp}`
  }
  return inp
}
