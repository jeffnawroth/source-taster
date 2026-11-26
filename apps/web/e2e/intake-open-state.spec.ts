// SPDX-License-Identifier: AGPL-3.0-or-later
// The intake field opens for focus and closes when focus leaves. Neither may
// move a control while a pointer is down, or the press lands on whatever moved
// underneath (#295). A focus change queues the decision for the next task, and
// that task can run after the pointer went down: it must wait for the release.
import { expect, test } from "@playwright/test";

test("the intake field changes size only after a press has ended, from where focus is then", async ({
  page,
}) => {
  await page.goto("/");
  const command = page.locator(".intake-command");
  await expect(command.locator("textarea")).toBeFocused();
  await expect(command).toHaveAttribute("data-open", "true");

  const states = await page.evaluate(async () => {
    const command = document.querySelector(".intake-command")!;
    const field = command.querySelector("textarea")!;
    const outside = [...document.querySelectorAll("button")].find(
      (button) => !command.contains(button) && !button.disabled,
    )!;
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const press = (type: "pointerdown" | "pointerup") =>
      window.dispatchEvent(
        new PointerEvent(type, { button: 0, bubbles: true }),
      );
    // Focus returns to the field, a press starts on a control outside it and
    // takes focus, all before the task the focus change queued has run.
    field.blur();
    field.focus();
    press("pointerdown");
    outside.focus();
    await wait(100);
    const during = command.getAttribute("data-open");
    press("pointerup");
    await wait(100);
    return { during, after: command.getAttribute("data-open") };
  });

  // Closing now would move the control under the pointer that is pressing it.
  expect(states.during).toBe("true");
  // The press is over and focus is outside the field.
  expect(states.after).toBeNull();
});
