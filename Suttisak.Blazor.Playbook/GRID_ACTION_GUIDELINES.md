# Data grid action placement

Use action placement to communicate scope. Row actions and selection actions are not competing styles; they solve different tasks.

## Canonical rule

- **Grid-level actions** belong in the grid command bar: search, filters, create, refresh, column settings, and export of the current view.
- **Single-record actions** belong with the row. A frequent primary action may be inline. Secondary or destructive actions should move into one compact row overflow control.
- **Multi-record actions** require `AppGridSelectionMode.Multiple` and belong in `AppGridShell.SelectionToolbar`.
- Set `AppGridShell.SelectionActive` from the selected-row count so the contextual selection toolbar **replaces** the normal toolbar while selection exists. Do not stack both toolbars.

## Row actions

Keep the row surface quiet. Prefer a record link for opening details, at most one frequent inline action, then a compact overflow for secondary actions.

Use the public `AppActionMenu` component with application-owned `AppButton`
callbacks or links. Its native popover escapes scrolling table containers,
supports Escape and outside dismissal, and returns focus to its trigger.
Contents retain native button/link semantics: Tab moves through actions;
ArrowUp/ArrowDown and Home/End also move focus. Load the library's standard
`blazor-utilities.js` asset for placement, focus, and close-on-action behavior.

Do not repeat a bank of `View / Edit / Copy / Delete / Download` buttons in every row.

## Batch actions

Enable multiple selection only when the product has meaningful actions that operate on several rows. Bind selection and expose contextual actions only after selection exists.

```razor
<AppGridShell AriaLabel="People"
              SelectionActive="@(selectedPeople.Count > 0)">
    <Toolbar>
        <span>@people.Count records</span>
    </Toolbar>

    <SelectionToolbar>
        <AppGridSelectionToolbar SelectedCount="@selectedPeople.Count" OnClear="ClearSelection">
            <Actions>
                <AppButton OnClick="ExportSelected">Export selected</AppButton>
                <AppButton Variant="AppButtonVariant.Danger" OnClick="DeleteSelected">
                    Delete selected
                </AppButton>
            </Actions>
        </AppGridSelectionToolbar>
    </SelectionToolbar>

    <ChildContent>
        <AppGrid TGridItem="Person"
                 Items="@people.AsQueryable()"
                 ItemKey="@(person => person.Id)"
                 SelectionMode="AppGridSelectionMode.Multiple"
                 @bind-SelectedItems="selectedPeople">
            ...
        </AppGrid>
    </ChildContent>
</AppGridShell>
```

Destructive batch actions still require an explicit confirmation before mutation.

The header checkbox selects the current sorted page or virtualized provider
window, including overscan, not every matching record. Selections from other
pages remain selected until explicitly cleared. Applications own whether a
search/filter change clears selection and must explain that policy to users.
Capture the selected keys before awaiting confirmation so a later selection
change cannot alter the confirmed operation.

`AppGridSelectionToolbar` exposes `AriaLabel`, `SelectedLabel`, `ClearLabel`,
and `SummaryTemplate` for application localization. Set `Busy` while awaiting
a batch operation; it disables the clear button and native form controls in
the action fieldset. Use buttons for batch mutations; links are not disabled
by a fieldset and should be disabled by the application when needed.

## Single selection

Use `AppGridSelectionMode.Single` when selection itself is part of the task, such as a master-detail workspace, inspector pane, comparison target, or another workflow where the selected row drives adjacent content.

Do **not** require `select row -> toolbar -> Edit` for ordinary editing when the same action can be reached directly from the row. That adds interaction without adding scope or safety.

The header select-all checkbox is intentionally available only in `Multiple` mode.

## Interaction separation

Checkbox selection, record navigation, and row controls must remain separate interactions.

Interactive content inside a row (`a`, `button`, `input`, `select`, `textarea`, `summary`, button roles, and editable content) must not toggle row selection. `blazor-utilities.js` enforces this contract for `AppGrid`.

## Decision table

| Action | Placement |
| --- | --- |
| Open details | Primary cell link or dedicated row action |
| Edit one record | Inline row action when frequent, otherwise row overflow |
| Delete one record | Row overflow + confirmation |
| Export current filtered view | Grid command bar |
| Export selected rows | Selection toolbar |
| Delete selected rows | Selection toolbar + confirmation |
| Change status for several rows | Selection toolbar |
| Create record | Page/grid command bar |
| Search, filter, refresh, columns | Grid command bar |

The Playbook `AppGrid` specimen and `/application-shell/records` route are the canonical executable examples for this policy.

## Decision history

### Space and navigation (2026-09-17)

- Paged grids may retain filler space to stabilize the control height. That
  space is plain surface: no row separators, hover feedback or action controls.
  Real records are identified explicitly, never inferred from non-empty cells.
  Virtualization spacer rows retain their geometry.
- Paged mode always shows `AppGridPaginator`, including a single page or zero
  results, with unavailable directions disabled. Use labelled chevron icons,
  visible keyboard focus, a page entry and a result summary.
- Virtual scrolling has a bounded scroll viewport, constant row height matching
  `ItemSize`, stable `ItemKey`, and no paginator. Show a localized result count.
  For remote data, query `StartIndex`/`Count` at the source. Virtualizing a local
  collection alone does not reduce database or network loading.
- Choose the mode for the application's task. Both modes remain supported;
  ErgoTrack uses virtual scrolling for its four administration grids.

This replaces the earlier proposal to collapse filler space and hide single-page
pagination. Microsoft documents intentional filler rows and customizable styling:
https://learn.microsoft.com/en-us/aspnet/core/blazor/components/quickgrid?view=aspnetcore-10.0#apply-row-styles
Carbon recommends matching pagination sizing to the connected table:
https://carbondesignsystem.com/components/pagination/usage/
Plain filler space is our convention, not a universal requirement from these sources.

PR #48 introduced `GridActionMenuDemo` and `GridSelectionToolbarDemo` as local
Playbook helpers. That reuse restriction is superseded by the public
`AppActionMenu` and `AppGridSelectionToolbar` contract described above. Both
examples now consume the library components; their record editing, CSV format,
and disposable data store remain application code.
