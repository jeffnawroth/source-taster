// SPDX-License-Identifier: AGPL-3.0-or-later
/** Validate and canonicalize ISBN-10/13 to ISBN-13; invalid input is not proof. */
export function normalizeIsbn(value: string): string | undefined {
  const digits = value
    .replace(/^ISBN(?:-1[03])?:?\s*/iu, "")
    .replace(/[\s-]/gu, "")
    .toUpperCase();
  if (/^\d{9}[\dX]$/u.test(digits)) {
    const sum = [...digits].reduce(
      (n, d, i) => n + (d === "X" ? 10 : Number(d)) * (10 - i),
      0,
    );
    if (sum % 11) return;
    const prefix = `978${digits.slice(0, 9)}`;
    const check =
      (10 -
        ([...prefix].reduce((n, d, i) => n + Number(d) * (i % 2 ? 3 : 1), 0) %
          10)) %
      10;
    return `${prefix}${check}`;
  }
  if (!/^97[89]\d{10}$/u.test(digits)) return;
  const sum = [...digits].reduce(
    (n, d, i) => n + Number(d) * (i % 2 ? 3 : 1),
    0,
  );
  return sum % 10 === 0 ? digits : undefined;
}
