// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Aria from "react-aria-components";
import { HistoryGlyph, Search, Settings, User, X } from "./workspace-icons.tsx";
import { m } from "@source-taster/i18n";
import { useStickySize } from "./sticky-layout.ts";
import {
  Autocomplete,
  useFilter,
  Button,
  IconButton,
  Kbd,
  Dialog,
  DialogHeading,
  DialogTrigger,
  Modal,
  Sheet,
  Popover,
  GlassSurface,
  SearchField,
  Menu,
  MenuItem,
  MenuSection,
  MenuHeading,
} from "./primitives/index.ts";
/** Lets entry actions hand focus back to the chip before opening a separate modal. */
export const AccountPopoverCloseContext = createContext<() => void>(() => {});
/** One launcher row of the current view (#194 D `cmdItems`). */
export interface PaletteCommand {
  id: string;
  group: "actions" | "filters" | "references";
  label: string;
  icon: ReactNode;
  /** Without one, the bar hands the id to `onCommand`. */
  onAction?: () => void;
  /** Shown muted under the label; the row stays visible but inert (D `hint`). */
  disabledReason?: string;
}
const groupHeading = {
  actions: () => m.shell_actions(),
  filters: () => m.shell_filters(),
  references: () => m.workspace_references(),
} as const;
const apple =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/u.test(navigator.platform);
export function CheckingTopBar({
  brandMark,
  documentName,
  account,
  accountLabel,
  history,
  onInput,
  onPreferences,
  tools,
  commands: viewCommands = [],
  onCommand,
}: {
  brandMark?: string;
  documentName?: string;
  account?: ReactNode;
  accountLabel?: string;
  history?: (close: () => void) => ReactNode;
  onInput: () => void;
  onPreferences: () => void;
  /** Host-supplied controls such as the persistent appearance toggle. */
  tools?: ReactNode;
  /** The view's Actions, Filters and References, in D's order. */
  commands?: PaletteCommand[];
  /** Runs a row that carries no handler of its own. */
  onCommand?: (id: string) => void;
}) {
  const [commands, setCommands] = useState(false);
  const topbar = useStickySize("--checking-topbar-height");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // #194 D keeps the account popover open, pinned under the sticky bar, while
  // the page scrolls. React Aria closes a non-modal popover on any ancestor
  // scroll; a window capture listener runs first and marks that close.
  const scrolling = useRef(false);
  useEffect(() => {
    if (!accountOpen) return;
    const mark = () => {
      scrolling.current = true;
      // Microtasks run between listeners of a native event; a task does not.
      setTimeout(() => {
        scrolling.current = false;
      });
    };
    window.addEventListener("scroll", mark, true);
    return () => window.removeEventListener("scroll", mark, true);
  }, [accountOpen]);
  const [query, setQuery] = useState("");
  const launcher = useRef<HTMLButtonElement>(null);
  const { contains } = useFilter({ sensitivity: "base" });
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuery("");
        setCommands((value) => !value);
      } else if (commands && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setCommands(false);
        requestAnimationFrame(() => launcher.current?.focus());
      }
    }
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [commands]);
  function close() {
    setCommands(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }
  function run(action: () => void) {
    setCommands(false);
    requestAnimationFrame(action);
  }
  return (
    <header ref={topbar} className="checking-topbar">
      <GlassSurface layer="topbar" className="checking-topbar-inner">
        <div className="checking-topbar-start">
          {history && (
            <DialogTrigger isOpen={historyOpen} onOpenChange={setHistoryOpen}>
              <Button
                variant="ghost"
                className="history-trigger"
                aria-label={m.history_heading()}
                icon={<HistoryGlyph aria-hidden="true" size={16} />}
                onPress={() => setHistoryOpen(true)}
              >
                <span className="history-trigger-label">
                  {m.history_heading()}
                </span>
              </Button>
              <Sheet>
                <Dialog className="history-sheet">
                  {({ close }) => (
                    <>
                      <div className="history-head">
                        <DialogHeading>{m.history_heading()}</DialogHeading>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<X aria-hidden="true" size={16} />}
                          onPress={close}
                        >
                          {m.shell_close()}
                        </Button>
                      </div>
                      {history(close)}
                    </>
                  )}
                </Dialog>
              </Sheet>
            </DialogTrigger>
          )}
          <div className="checking-brand">
            {brandMark && <img src={brandMark} alt="" width={28} height={28} />}
            <div className="checking-brand-text">
              <h1>{m.app_title()}</h1>
              {documentName && <p title={documentName}>{documentName}</p>}
            </div>
          </div>
        </div>
        <DialogTrigger isOpen={commands} onOpenChange={setCommands}>
          <Button
            ref={launcher}
            variant="ghost"
            // The name is the visible hint (WCAG 2.5.3); the shortcut glyph
            // is aria-hidden.
            onPress={() => {
              setQuery("");
              setCommands(true);
            }}
            className="command-trigger"
            icon={<Search aria-hidden="true" size={16} />}
          >
            <span className="command-trigger-label">
              {m.shell_command_hint()}
            </span>
            <Kbd modifier={apple ? "apple" : "other"} aria-hidden="true">
              K
            </Kbd>
          </Button>
          <Modal material="command-palette">
            <Dialog aria-label={m.shell_commands()} className="command-palette">
              <DialogHeading className="sr-only">
                {m.shell_commands()}
              </DialogHeading>
              <Autocomplete
                filter={contains}
                inputValue={query}
                onInputChange={setQuery}
              >
                <div className="command-palette-search">
                  <SearchField
                    autoFocus
                    label={m.shell_find_command()}
                    placeholder={m.shell_command_placeholder()}
                    clearLabel={m.shell_clear_command()}
                    value={query}
                    onChange={setQuery}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={m.shell_close_shortcut()}
                    onPress={close}
                    className="command-palette-close"
                  >
                    <Kbd>esc</Kbd>
                  </Button>
                </div>
                <Menu
                  autoFocus="first"
                  aria-label={m.shell_commands()}
                  className="command-palette-list"
                  renderEmptyState={() => (
                    <p className="command-palette-empty">
                      {m.shell_command_empty()}
                    </p>
                  )}
                >
                  <MenuSection aria-label={m.shell_navigation()}>
                    <MenuHeading className="command-palette-group">
                      {m.shell_navigation()}
                    </MenuHeading>
                    <MenuItem
                      id="input"
                      textValue={m.shell_enter_references()}
                      onAction={() => run(onInput)}
                    >
                      <Search aria-hidden="true" size={18} />
                      <Aria.Text slot="label">
                        {m.shell_enter_references()}
                      </Aria.Text>
                    </MenuItem>
                    {history && (
                      <MenuItem
                        id="history"
                        textValue={m.history_heading()}
                        onAction={() => run(() => setHistoryOpen(true))}
                      >
                        <HistoryGlyph aria-hidden="true" size={18} />
                        <Aria.Text slot="label">
                          {m.history_heading()}
                        </Aria.Text>
                      </MenuItem>
                    )}
                    {account && (
                      <MenuItem
                        id="account"
                        textValue={m.shell_account()}
                        onAction={() => run(() => setAccountOpen(true))}
                      >
                        <User aria-hidden="true" size={18} />
                        <Aria.Text slot="label">{m.shell_account()}</Aria.Text>
                      </MenuItem>
                    )}
                  </MenuSection>
                  {(["actions", "filters", "references"] as const).map(
                    (group) => {
                      const rows = viewCommands.filter(
                        (command) => command.group === group,
                      );
                      if (!rows.length) return null;
                      return (
                        <MenuSection
                          key={group}
                          aria-label={groupHeading[group]()}
                        >
                          <MenuHeading className="command-palette-group">
                            {groupHeading[group]()}
                          </MenuHeading>
                          {rows.map((command) => (
                            <MenuItem
                              key={command.id}
                              id={command.id}
                              textValue={command.label}
                              isDisabled={!!command.disabledReason}
                              onAction={() =>
                                run(
                                  command.onAction ??
                                    (() => onCommand?.(command.id)),
                                )
                              }
                            >
                              {command.icon}
                              <Aria.Text slot="label">
                                {command.label}
                              </Aria.Text>
                              {command.disabledReason ? (
                                <Aria.Text
                                  slot="description"
                                  elementType="small"
                                >
                                  {command.disabledReason}
                                </Aria.Text>
                              ) : null}
                            </MenuItem>
                          ))}
                        </MenuSection>
                      );
                    },
                  )}
                </Menu>
              </Autocomplete>
            </Dialog>
          </Modal>
        </DialogTrigger>
        <div className="checking-topbar-end">
          {tools}
          {!account && (
            <IconButton label={m.shell_preferences()} onPress={onPreferences}>
              <Settings aria-hidden="true" size={16.5} />
            </IconButton>
          )}
          {account && (
            <DialogTrigger
              isOpen={accountOpen}
              onOpenChange={(open) => {
                if (!open && scrolling.current) return;
                setAccountOpen(open);
              }}
            >
              <Button
                variant="ghost"
                className="account-chip"
                aria-label={
                  accountLabel
                    ? `${m.shell_account()}: ${accountLabel}`
                    : `${m.shell_account()}: ${m.shell_guest()}`
                }
              >
                {accountLabel ? (
                  <span className="account-avatar" aria-hidden="true">
                    {accountLabel[0]?.toLocaleUpperCase()}
                  </span>
                ) : (
                  <span className="account-avatar" aria-hidden="true">
                    <User size={17} />
                  </span>
                )}
                <span className="account-chip-label">
                  {accountLabel ?? m.shell_guest()}
                </span>
              </Button>
              <Popover
                className="account-entry"
                placement="bottom end"
                /* #194 D .pop sits at top: 62px (pinned in workspace.css). */
                offset={12.5}
              >
                <Dialog aria-label={m.shell_account()}>
                  {({ close }) => (
                    <AccountPopoverCloseContext.Provider value={close}>
                      <DialogHeading>
                        {m.shell_account()} ·{" "}
                        {accountLabel
                          ? m.shell_signed_in_as({ name: accountLabel })
                          : m.shell_guest()}
                      </DialogHeading>
                      {account}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="account-entry-preferences"
                        onPress={() => {
                          close();
                          requestAnimationFrame(onPreferences);
                        }}
                      >
                        {m.shell_preferences()}
                      </Button>
                    </AccountPopoverCloseContext.Provider>
                  )}
                </Dialog>
              </Popover>
            </DialogTrigger>
          )}
        </div>
      </GlassSurface>
    </header>
  );
}
