// SPDX-License-Identifier: AGPL-3.0-or-later
import * as Aria from "react-aria-components";
import { styles } from "./utils.ts";

/** One keyboard entry, spatial navigation and stable caller-owned item identities. */
export function GridList<T extends object>(props: Aria.GridListProps<T>) {
  return (
    <Aria.GridList
      {...props}
      className={styles(props.className, "st-grid-list st-focus")}
    />
  );
}
export function GridListItem<T extends object>(
  props: Aria.GridListItemProps<T> & { ref?: React.Ref<HTMLDivElement> },
) {
  return (
    <Aria.GridListItem
      {...props}
      className={styles(props.className, "st-grid-item st-focus")}
    />
  );
}
