// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";

test("the distributed static recipes and fonts retain their complete notices", async ({
  page,
  request,
}) => {
  for (const language of ["de", "en"]) {
    await page.goto(`/${language}/`);
    const link = page.getByRole("link", {
      name:
        language === "en"
          ? "Interface licenses and notices"
          : "Oberflächenlizenzen und Hinweise",
      exact: true,
    });
    await expect(link).toHaveAttribute("href", "/third-party/ui/NOTICE.txt");
    const response = await request.get((await link.getAttribute("href"))!);
    expect(response.status()).toBe(200);
    const notice = await response.text();
    for (const grant of [
      "Apache License",
      "END OF TERMS AND CONDITIONS",
      "Permission is hereby granted, free of charge",
      "SIL OPEN FONT LICENSE",
      'Reserved Font Name "Plex"',
      "Atkinson Hyperlegible Next Project Authors",
    ])
      expect(notice).toContain(grant);
  }
});
