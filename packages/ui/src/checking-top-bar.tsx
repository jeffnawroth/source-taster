// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Autocomplete, useFilter } from "react-aria-components";
import { Command, History, UserRound, X } from "lucide-react";
import { m } from "@source-taster/i18n";
import {
  Button,
  IconButton,
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
} from "./primitives/index.ts";
export function CheckingTopBar({
  documentName,
  account,
  accountLabel,
  history,
  onInput,
  onReset,
  onPreferences,
  onStop,
}: {
  documentName?: string;
  account?: ReactNode;
  accountLabel?: string;
  history?: (close: () => void) => ReactNode;
  onInput: () => void;
  onReset: () => void;
  onPreferences: () => void;
  onStop?: () => void;
}) {
  const [commands, setCommands] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
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
    <header className="checking-topbar">
      <GlassSurface layer="topbar" className="checking-topbar-inner">
        {history && (
          <DialogTrigger isOpen={historyOpen} onOpenChange={setHistoryOpen}>
            <IconButton
              label={m.history_heading()}
              onPress={() => setHistoryOpen(true)}
            >
              <History aria-hidden="true" size={20} />
            </IconButton>
            <Sheet>
              <Dialog>
                {({ close }) => (
                  <>
                    <div className="st-actions">
                      <DialogHeading>{m.history_heading()}</DialogHeading>
                      <IconButton label={m.shell_close()} onPress={close}>
                        <X aria-hidden="true" size={20} />
                      </IconButton>
                    </div>
                    {history(close)}
                  </>
                )}
              </Dialog>
            </Sheet>
          </DialogTrigger>
        )}
        <div className="checking-brand">
          <h1>{m.app_title()}</h1>
          {documentName && <p title={documentName}>{documentName}</p>}
        </div>
        <DialogTrigger isOpen={commands} onOpenChange={setCommands}>
          <Button
            ref={launcher}
            variant="ghost"
            aria-label={m.shell_commands()}
            onPress={() => {
              setQuery("");
              setCommands(true);
            }}
            className="command-trigger"
          >
            <Command aria-hidden="true" size={20} />
            <span>{m.shell_commands()}</span>
          </Button>
          <Modal material="command-palette">
            <Dialog aria-label={m.shell_commands()}>
              <div className="st-actions">
                <DialogHeading>{m.shell_commands()}</DialogHeading>
                <IconButton label={m.shell_close()} onPress={close}>
                  <X aria-hidden="true" size={20} />
                </IconButton>
              </div>
              <Autocomplete filter={contains}>
                <SearchField
                  autoFocus
                  label={m.shell_find_command()}
                  clearLabel={m.shell_clear_command()}
                  value={query}
                  onChange={setQuery}
                />
                <Menu aria-label={m.shell_commands()}>
                  <MenuItem id="input" onAction={() => run(onInput)}>
                    {m.shell_enter_references()}
                  </MenuItem>
                  <MenuItem id="reset" onAction={() => run(onReset)}>
                    {m.shell_new_check()}
                  </MenuItem>
                  <MenuItem
                    id="preferences"
                    onAction={() => run(onPreferences)}
                  >
                    {m.shell_preferences()}
                  </MenuItem>
                  {onStop && (
                    <MenuItem id="stop" onAction={() => run(onStop)}>
                      {m.check_cancel()}
                    </MenuItem>
                  )}
                </Menu>
              </Autocomplete>
            </Dialog>
          </Modal>
        </DialogTrigger>
        {account && (
          <DialogTrigger>
            <Button
              variant="ghost"
              aria-label={`${m.shell_account()}: ${accountLabel ?? m.auth_sign_in()}`}
            >
              <UserRound aria-hidden="true" size={20} />
              <span className="account-chip-label">
                {accountLabel ?? m.auth_sign_in()}
              </span>
            </Button>
            <Popover className="account-entry">
              <Dialog aria-label={m.shell_account()}>{account}</Dialog>
            </Popover>
          </DialogTrigger>
        )}
      </GlassSurface>
    </header>
  );
}
