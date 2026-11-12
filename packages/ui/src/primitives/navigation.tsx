// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import * as Aria from "react-aria-components";
import { ChevronRight } from "lucide-react";
import { cx, styles } from "./utils.ts";
import { focusRing } from "../recipes.ts";
export function Menu<T extends object>(props: Aria.MenuProps<T>) {
  return (
    <Aria.Menu
      {...props}
      className={styles(props.className, "st-menu outline-none")}
    />
  );
}
export function MenuItem<T extends object>(props: Aria.MenuItemProps<T>) {
  return (
    <Aria.MenuItem
      {...props}
      className={styles(props.className, `st-option ${focusRing}`)}
    />
  );
}
export function MenuSection<T extends object>(props: Aria.MenuSectionProps<T>) {
  return (
    <Aria.MenuSection
      {...props}
      className={cx("flex flex-col gap-1", props.className)}
    />
  );
}
export function Disclosure(props: Aria.DisclosureProps) {
  return (
    <Aria.Disclosure
      {...props}
      className={styles(
        props.className,
        "st-disclosure rounded-md border border-border bg-surface text-text",
      )}
    />
  );
}
export function DisclosureTrigger(props: Aria.ButtonProps) {
  return (
    <Aria.Button
      {...props}
      slot="trigger"
      className={styles(
        props.className,
        `${focusRing} flex min-h-9 w-full items-center gap-2 rounded-md p-2 text-start text-base [overflow-wrap:anywhere]`,
      )}
    >
      {Aria.composeRenderProps(props.children, (children) => (
        <>
          <ChevronRight
            aria-hidden="true"
            size={20}
            strokeWidth={1.75}
            className="st-disclosure-chevron shrink-0"
          />
          {children}
        </>
      ))}
    </Aria.Button>
  );
}
export function DisclosurePanel(props: Aria.DisclosurePanelProps) {
  return (
    <Aria.DisclosurePanel
      {...props}
      className={styles(
        props.className,
        "px-3 pb-3 text-base [overflow-wrap:anywhere]",
      )}
    />
  );
}
export function Tabs(props: Aria.TabsProps) {
  return (
    <Aria.Tabs
      {...props}
      className={styles(
        props.className,
        "flex min-w-0 flex-col gap-3 text-text",
      )}
    />
  );
}
export function TabList<T extends object>(props: Aria.TabListProps<T>) {
  return (
    <Aria.TabList
      {...props}
      className={styles(
        props.className,
        "st-tab-list flex max-w-full gap-1 overflow-x-auto border-b border-border p-1",
      )}
    />
  );
}
export function Tab(props: Aria.TabProps) {
  return (
    <Aria.Tab
      {...props}
      className={styles(
        props.className,
        `st-tab ${focusRing} relative flex min-h-9 shrink-0 items-center px-3 py-1 text-base text-text-secondary`,
      )}
    />
  );
}
export function TabPanel(props: Aria.TabPanelProps) {
  return (
    <Aria.TabPanel
      {...props}
      className={styles(
        props.className,
        `${focusRing} min-w-0 rounded-md p-1 text-base [overflow-wrap:anywhere]`,
      )}
    />
  );
}
export { DisclosureGroup } from "react-aria-components";

export function Toolbar(props: Aria.ToolbarProps) {
  return (
    <Aria.Toolbar
      {...props}
      className={styles(props.className, "st-toolbar")}
    />
  );
}
export { Autocomplete, useFilter } from "react-aria-components";
