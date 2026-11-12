// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import * as Aria from "react-aria-components";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { styles } from "./utils.ts";
import { focusRing } from "../recipes.ts";
export function Table(props: Aria.TableProps) {
  return (
    <Aria.ResizableTableContainer className="st-table-container rounded-lg border border-border-emphasis bg-surface">
      <Aria.Table
        {...props}
        className={styles(
          props.className,
          "st-table w-full border-separate border-spacing-0 text-sm text-text",
        )}
      />
    </Aria.ResizableTableContainer>
  );
}
export function TableHeader<T extends object>(props: Aria.TableHeaderProps<T>) {
  return (
    <Aria.TableHeader
      {...props}
      className={styles(
        props.className,
        "sticky top-0 bg-surface text-xs font-semibold text-text-secondary",
      )}
    />
  );
}
export function TableBody<T extends object>(props: Aria.TableBodyProps<T>) {
  return <Aria.TableBody {...props} />;
}
export function Column(props: Aria.ColumnProps) {
  return (
    <Aria.Column
      {...props}
      className={styles(
        props.className,
        `${focusRing} min-h-6 px-3 py-2 text-start [overflow-wrap:anywhere]`,
      )}
    >
      {Aria.composeRenderProps(
        props.children,
        (children, { allowsSorting, sortDirection }) => {
          const Icon =
            sortDirection === "ascending"
              ? ArrowUp
              : sortDirection === "descending"
                ? ArrowDown
                : ArrowUpDown;
          return (
            <span className="inline-flex min-h-6 items-center gap-1">
              {children}
              {allowsSorting && (
                <Icon aria-hidden="true" size={16} strokeWidth={1.75} />
              )}
            </span>
          );
        },
      )}
    </Aria.Column>
  );
}
export function Row<T extends object>(props: Aria.RowProps<T>) {
  return (
    <Aria.Row
      {...props}
      className={styles(props.className, `st-row ${focusRing} min-h-10`)}
    />
  );
}
export function Cell(props: Aria.CellProps & { numeric?: boolean }) {
  const { numeric, ...rest } = props;
  return (
    <Aria.Cell
      {...rest}
      className={styles(
        props.className,
        `${focusRing} border-t border-border px-3 py-2 [overflow-wrap:anywhere] ${numeric ? "text-end tabular-nums" : "text-start"}`,
      )}
    />
  );
}
export function ColumnResizer(props: Aria.ColumnResizerProps) {
  return (
    <Aria.ColumnResizer
      {...props}
      className={styles(props.className, `st-column-resizer ${focusRing}`)}
    />
  );
}
