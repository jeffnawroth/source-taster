// SPDX-License-Identifier: AGPL-3.0-or-later
// Reproducible component evidence, deliberately isolated from product routes and services.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, type SortDescriptor } from "react-aria-components";
import { Settings, Upload } from "lucide-react";
import * as UI from "@source-taster/ui/primitives";
import "./style.css";
const copy = {
  en: {
    title: "Source Taster primitives",
    actions: "Actions",
    fields: "Fields",
    selection: "Selection",
    overlays: "Overlays",
    structure: "Navigation and table",
    display: "Display",
    check: "Start a new check from the selected references",
    short: "Continue",
    unavailable: "Start check",
    reason: "Add at least one reference first.",
    pending: "Prepare report",
    name: "Document title",
    disabled: "unavailable",
    required: "required",
    description: "Use a title you will recognize later.",
    error: "Enter a document title.",
    submit: "Save example",
    notes: "Notes",
    search: "Search references",
    clear: "Clear search",
    style: "Citation style",
    language: "Language",
    immediate: "Show all labels",
    sources: "Data sources",
    method: "Input format",
    file: "Choose file",
    drop: "Drop a PDF or DOCX file here, or choose a file.",
    settings: "Settings",
    menu: "Actions menu",
    details: "Show details",
    close: "Close",
    consequence:
      "This removes the example document. You can cancel to keep it.",
    cancel: "Keep document",
    remove: "Remove document",
    sheet: "Open history sheet",
    history: "History",
    about: "How this works",
    aboutText: "Each primitive uses the accepted semantic roles.",
    tabOne: "References",
    tabTwo: "Evidence",
    progress: "4 of 10 references checked",
    quota: "12 of 50 checks remain",
    warning: "Few checks remain.",
    feedback: {
      info: "You can keep working on this example.",
      success: "Your example was saved.",
      warning: "Review the selected references before continuing.",
      danger: "The example could not be saved. Try again.",
    },
    toast: "Show notification",
    actionToast: "Show action notification",
    dangerToast: "Show error notification",
    undo: "Undo",
    region: "Notifications",
    toastTitle: "Example saved",
    toastDescription: "You can continue working.",
    errorTitle: "Example could not be saved",
    external: "Documentation",
    newTab: "opens in a new tab",
    tagLabel: "Active filters",
    tag: "Selected references",
    removeTag: "Remove selected references",
    table: "Example documents",
    column: "Document",
    count: "References",
    long: "A deliberately long reference label that wraps without losing its meaning",
    loading: "References are being recognized",
    status: "Example state",
    glass: "Floating header",
    command: "Command palette material",
    toggle: "Show labels",
    badge: "3 references",
  },
  de: {
    title: "Source Taster: Grundkomponenten",
    actions: "Aktionen",
    fields: "Eingabefelder",
    selection: "Auswahl",
    overlays: "Schwebende Ebenen",
    structure: "Navigation und Tabelle",
    display: "Anzeige",
    check: "Aus den ausgewählten Referenzen eine neue Prüfung starten",
    short: "Weiter",
    unavailable: "Prüfung starten",
    reason: "Fügen Sie zuerst mindestens eine Referenz hinzu.",
    pending: "Prüfbericht vorbereiten",
    name: "Dokumenttitel",
    disabled: "nicht verfügbar",
    required: "Pflichtfeld",
    description: "Wählen Sie einen Titel, den Sie später wiedererkennen.",
    error: "Geben Sie einen Dokumenttitel ein.",
    submit: "Beispiel speichern",
    notes: "Notizen",
    search: "Referenzen durchsuchen",
    clear: "Suche leeren",
    style: "Zitierstil",
    language: "Sprache",
    immediate: "Alle Labels zeigen",
    sources: "Datenquellen",
    method: "Eingabeformat",
    file: "Datei auswählen",
    drop: "Ziehen Sie eine PDF- oder DOCX-Datei hierher oder wählen Sie eine Datei aus.",
    settings: "Einstellungen",
    menu: "Aktionsmenü",
    details: "Details anzeigen",
    close: "Schließen",
    consequence:
      "Das Beispieldokument wird entfernt. Sie können es behalten, indem Sie abbrechen.",
    cancel: "Dokument behalten",
    remove: "Dokument entfernen",
    sheet: "Verlauf öffnen",
    history: "Verlauf",
    about: "So funktioniert es",
    aboutText:
      "Jede Grundkomponente verwendet die akzeptierten semantischen Rollen.",
    tabOne: "Referenzen",
    tabTwo: "Nachweise",
    progress: "4 von 10 Referenzen geprüft",
    quota: "Noch 12 von 50 Prüfungen",
    warning: "Nur noch wenige Prüfungen verfügbar.",
    feedback: {
      info: "Sie können dieses Beispiel weiterbearbeiten.",
      success: "Ihr Beispiel wurde gespeichert.",
      warning: "Prüfen Sie die ausgewählten Referenzen, bevor Sie fortfahren.",
      danger:
        "Das Beispiel konnte nicht gespeichert werden. Versuchen Sie es erneut.",
    },
    toast: "Mitteilung anzeigen",
    actionToast: "Mitteilung mit Aktion anzeigen",
    dangerToast: "Fehlermitteilung anzeigen",
    undo: "Rückgängig",
    region: "Mitteilungen",
    toastTitle: "Beispiel gespeichert",
    toastDescription: "Sie können weiterarbeiten.",
    errorTitle: "Beispiel konnte nicht gespeichert werden",
    external: "Dokumentation",
    newTab: "öffnet in einem neuen Tab",
    tagLabel: "Aktive Filter",
    tag: "Ausgewählte Referenzen",
    removeTag: "Ausgewählte Referenzen entfernen",
    table: "Beispieldokumente",
    column: "Dokument",
    count: "Referenzen",
    long: "Eine absichtlich lange Referenzbezeichnung, die ohne Bedeutungsverlust umbricht",
    loading: "Referenzen werden erkannt",
    status: "Beispielzustand",
    glass: "Schwebende Kopfzeile",
    command: "Material der Befehlspalette",
    toggle: "Labels zeigen",
    badge: "3 Referenzen",
  },
};
function Examples() {
  const query = new URLSearchParams(location.search);
  const locale = query.get("lang") === "de" ? "de" : "en";
  const t = copy[locale];
  document.documentElement.lang = locale;
  const theme = query.get("theme");
  if (theme === "light" || theme === "dark")
    document.documentElement.dataset.theme = theme;
  const [pending, setPending] = useState(false);
  const [segment, setSegment] = useState("text");
  const [count, setCount] = useState(0);
  const [tag, setTag] = useState(true);
  const [sort, setSort] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [controller] = useState(UI.createToastQueue);
  return (
    <I18nProvider locale={locale}>
      <main>
        <h1>{t.title}</h1>
        <nav className="row" aria-label={t.language}>
          {["de", "en"].map((lang) => (
            <UI.Link
              key={lang}
              href={`?lang=${lang}&theme=${theme ?? "light"}`}
            >
              {lang.toUpperCase()}
            </UI.Link>
          ))}
        </nav>
        <p>
          {t.status}: <output data-testid="count">{count}</output>
        </p>
        <div className="specimens">
          <section aria-label={t.actions}>
            <h2>{t.actions}</h2>
            <div className="stack">
              <UI.Button variant="primary" onPress={() => setCount(count + 1)}>
                {t.check}
              </UI.Button>
              <div className="row">
                <UI.Button size="sm">{t.short}</UI.Button>
                <UI.ToggleButton>{t.toggle}</UI.ToggleButton>
                <UI.IconButton label={t.settings} isPending={pending}>
                  <Settings aria-hidden="true" size={20} strokeWidth={1.75} />
                </UI.IconButton>
              </div>
              <UI.Button isDisabled disabledReason={t.reason}>
                {t.unavailable}
              </UI.Button>
              <UI.Button
                data-testid="pending"
                isPending={pending}
                onPress={() => {
                  setPending(true);
                  setTimeout(() => setPending(false), 1000);
                }}
              >
                {t.pending}
              </UI.Button>
              <UI.Link
                href="https://example.org"
                target="_blank"
                newTabLabel={t.newTab}
              >
                {t.external}
              </UI.Link>
            </div>
          </section>
          <section aria-label={t.fields}>
            <h2>{t.fields}</h2>
            <div className="stack">
              <UI.Form
                onSubmit={(event) => {
                  event.preventDefault();
                  setCount(count + 1);
                }}
              >
                <UI.TextField
                  name="title"
                  label={t.name}
                  isRequired
                  requiredLabel={t.required}
                  description={t.description}
                  errorMessage={t.error}
                />
                <UI.TextField label={t.notes} multiline />
                <UI.Button type="submit">{t.submit}</UI.Button>
              </UI.Form>
              <UI.SearchField label={t.search} clearLabel={t.clear} />
              <UI.Select label={t.language} defaultSelectedKey="de">
                <UI.ListBoxItem id="de">Deutsch</UI.ListBoxItem>
                <UI.ListBoxItem id="en">English</UI.ListBoxItem>
                <UI.ListBoxItem id="long">{t.long}</UI.ListBoxItem>
              </UI.Select>
              <UI.ComboBox
                label={t.style}
                defaultItems={[
                  { id: "apa", name: "APA" },
                  { id: "ecole", name: "École française" },
                  { id: "chicago", name: "Chicago" },
                ]}
              >
                {(item) => (
                  <UI.ListBoxItem id={item.id}>{item.name}</UI.ListBoxItem>
                )}
              </UI.ComboBox>
              <UI.TextField
                label={`${t.name} (${t.disabled})`}
                isDisabled
                disabledReason={t.reason}
              />
            </div>
          </section>
          <section aria-label={t.selection}>
            <h2>{t.selection}</h2>
            <div className="stack">
              <UI.CheckboxGroup label={t.sources} defaultValue={["openalex"]}>
                <UI.Checkbox value="openalex">OpenAlex</UI.Checkbox>
                <UI.Checkbox value="crossref">Crossref</UI.Checkbox>
                <UI.Checkbox isIndeterminate>{t.long}</UI.Checkbox>
              </UI.CheckboxGroup>
              <UI.RadioGroup label={t.method} defaultValue="text">
                <UI.Radio value="text">Text</UI.Radio>
                <UI.Radio value="file">PDF / DOCX</UI.Radio>
              </UI.RadioGroup>
              <UI.Switch>{t.immediate}</UI.Switch>
              <UI.SegmentedControl
                label={t.method}
                items={[
                  { id: "text", label: "Text" },
                  { id: "file", label: "PDF / DOCX" },
                ]}
                value={segment}
                onChange={setSegment}
              />
              <UI.DropZone>
                <p>{t.drop}</p>
                <UI.FileTrigger
                  acceptedFileTypes={[
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ]}
                  onSelect={(files) => setCount(files?.length ?? 0)}
                >
                  <UI.Button>
                    <Upload aria-hidden="true" size={20} strokeWidth={1.75} />
                    {t.file}
                  </UI.Button>
                </UI.FileTrigger>
              </UI.DropZone>
              <UI.TagGroup
                label={t.tagLabel}
                items={tag ? [{ id: "selected", label: t.tag }] : []}
                onRemove={() => setTag(false)}
              >
                {(item) => (
                  <UI.Tag
                    id={item.id}
                    label={item.label}
                    removeLabel={t.removeTag}
                  />
                )}
              </UI.TagGroup>
            </div>
          </section>
          <section aria-label={t.overlays}>
            <h2>{t.overlays}</h2>
            <div className="stack">
              <div className="row">
                <UI.DialogTrigger>
                  <UI.Button>{t.details}</UI.Button>
                  <UI.Modal>
                    <UI.DialogContent title={t.details} closeLabel={t.close}>
                      <p>{t.long}</p>
                      <UI.TextField label={t.notes} />
                    </UI.DialogContent>
                  </UI.Modal>
                </UI.DialogTrigger>
                <UI.DialogTrigger>
                  <UI.Button>{t.remove}</UI.Button>
                  <UI.Modal>
                    <UI.AlertDialog
                      title={t.remove}
                      cancelLabel={t.cancel}
                      actionLabel={t.remove}
                      onAction={() => setCount(count + 1)}
                    >
                      {t.consequence}
                    </UI.AlertDialog>
                  </UI.Modal>
                </UI.DialogTrigger>
                <UI.DialogTrigger>
                  <UI.Button>{t.sheet}</UI.Button>
                  <UI.Sheet>
                    <UI.DialogContent title={t.history} closeLabel={t.close}>
                      <p>{t.long}</p>
                    </UI.DialogContent>
                  </UI.Sheet>
                </UI.DialogTrigger>
              </div>
              <UI.MenuTrigger>
                <UI.Button>{t.menu}</UI.Button>
                <UI.Popover>
                  <UI.Menu
                    aria-label={t.menu}
                    onAction={() => setCount(count + 1)}
                  >
                    <UI.MenuItem id="one">{t.long}</UI.MenuItem>
                    <UI.MenuItem id="two">
                      {t.short}
                      <UI.Kbd>↵</UI.Kbd>
                    </UI.MenuItem>
                  </UI.Menu>
                </UI.Popover>
              </UI.MenuTrigger>
              <UI.DialogTrigger>
                <UI.Button>{t.settings}</UI.Button>
                <UI.Popover>
                  <UI.DialogContent title={t.settings} closeLabel={t.close}>
                    <UI.Switch>{t.immediate}</UI.Switch>
                  </UI.DialogContent>
                </UI.Popover>
              </UI.DialogTrigger>
              <UI.Button
                onPress={() =>
                  controller.add({
                    title: t.toastTitle,
                    description: t.toastDescription,
                  })
                }
              >
                {t.toast}
              </UI.Button>
              <UI.Button
                onPress={() =>
                  controller.add({
                    title: t.toastTitle,
                    action: {
                      label: t.undo,
                      onAction: () => setCount(count + 1),
                    },
                  })
                }
              >
                {t.actionToast}
              </UI.Button>
              <UI.Button
                onPress={() =>
                  controller.add({ title: t.errorTitle, tone: "danger" })
                }
              >
                {t.dangerToast}
              </UI.Button>
            </div>
          </section>
          <section aria-label={t.structure}>
            <h2>{t.structure}</h2>
            <div className="stack">
              <UI.Disclosure>
                <UI.DisclosureTrigger>{t.about}</UI.DisclosureTrigger>
                <UI.DisclosurePanel>{t.aboutText}</UI.DisclosurePanel>
              </UI.Disclosure>
              <UI.Tabs>
                <UI.TabList aria-label={t.structure}>
                  <UI.Tab id="references">{t.tabOne}</UI.Tab>
                  <UI.Tab id="evidence">{t.tabTwo}</UI.Tab>
                </UI.TabList>
                <UI.TabPanel id="references">{t.long}</UI.TabPanel>
                <UI.TabPanel id="evidence">{t.aboutText}</UI.TabPanel>
              </UI.Tabs>
              <UI.Table
                aria-label={t.table}
                sortDescriptor={sort}
                onSortChange={setSort}
                selectionMode="multiple"
                selectionBehavior="toggle"
              >
                <UI.TableHeader>
                  <UI.Column id="selection" aria-label={t.selection}>
                    <UI.Checkbox slot="selection" aria-label={t.selection} />
                  </UI.Column>
                  <UI.Column id="name" isRowHeader allowsSorting>
                    {t.column}
                  </UI.Column>
                  <UI.Column id="count">{t.count}</UI.Column>
                </UI.TableHeader>
                <UI.TableBody>
                  {(sort.direction === "ascending" ? [1, 2] : [2, 1]).map(
                    (id) => (
                      <UI.Row id={id} key={id}>
                        <UI.Cell>
                          <UI.Checkbox
                            slot="selection"
                            aria-label={`${t.selection} ${id}`}
                          />
                        </UI.Cell>
                        <UI.Cell>
                          {id === 1 ? t.long : "DOI: 10.1000/example"}
                        </UI.Cell>
                        <UI.Cell numeric>{id * 3}</UI.Cell>
                      </UI.Row>
                    ),
                  )}
                </UI.TableBody>
              </UI.Table>
            </div>
          </section>
          <section aria-label={t.display}>
            <h2>{t.display}</h2>
            <div className="stack">
              <div className="row">
                <UI.Badge>{t.badge}</UI.Badge>
                <UI.Kbd modifier="apple">K</UI.Kbd>
                <UI.Kbd modifier="other">K</UI.Kbd>
              </div>
              {(["info", "success", "warning", "danger"] as const).map(
                (tone) => (
                  <UI.Banner key={tone} tone={tone}>
                    {t.feedback[tone]}
                  </UI.Banner>
                ),
              )}
              <UI.ProgressBar label={t.progress} value={4} maxValue={10} />
              <UI.Meter
                label={t.quota}
                value={12}
                maxValue={50}
                warning={t.warning}
              />
              <UI.Spinner label={t.progress} />
              <div role="status" aria-label={t.loading}>
                <UI.Skeleton className="h-9 w-full" />
              </div>
              <UI.Separator />
              <div className="glass-backdrop">
                <UI.GlassSurface
                  layer="detail-header"
                  className="rounded-lg p-4"
                  data-testid="glass"
                >
                  <span data-contrast="text">{t.glass}</span>
                  <p
                    className="text-text-on-glass-secondary"
                    data-contrast="secondary"
                  >
                    {t.aboutText}
                  </p>
                </UI.GlassSurface>
              </div>
              <UI.DialogTrigger>
                <UI.Button>{t.command}</UI.Button>
                <UI.Modal material="command-palette">
                  <UI.DialogContent title={t.command} closeLabel={t.close}>
                    <p className="text-text-on-glass-secondary">
                      {t.aboutText}
                    </p>
                  </UI.DialogContent>
                </UI.Modal>
              </UI.DialogTrigger>
            </div>
          </section>
        </div>
        <UI.ToastRegion
          controller={controller}
          label={t.region}
          closeLabel={t.close}
        />
      </main>
    </I18nProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Examples />);
