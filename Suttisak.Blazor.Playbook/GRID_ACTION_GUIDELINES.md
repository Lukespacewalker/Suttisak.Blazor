# Data grid action placement

Use action placement to communicate scope. Row actions and selection actions are not competing styles; they solve different tasks.

## Canonical rule

- **Grid-level actions** belong in the grid command bar: search, filters, create, refresh, column settings, and export of the current view.
- **Single-record actions** belong with the row. A frequent primary action may be inline. Secondary or destructive actions should move into one compact row overflow control.
- **Multi-record actions** require `AppGridSelectionMode.Multiple` and belong in `AppGridShell.SelectionToolbar`.
- Set `AppGridShell.SelectionActive` from the selected-row count so the contextual selection toolbar **replaces** the normal toolbar while selection exists. Do not stack both toolbars.

## Row actions

Keep the row surface quiet. Prefer a record link for opening details, at most one frequent inline action, then a compact overflow for secondary actions.

The Playbook uses `GridActionMenuDemo` to demonstrate this composition. It is a Playbook helper, not a public `Suttisak.Blazor.UserInterface` component. Consuming applications may use their own accessible overflow/menu implementation while preserving the same placement rule.

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
        @* Compose an accessible toolbar here. The Playbook uses
           GridSelectionToolbarDemo only as an executable example. *@
        <div role="toolbar" aria-label="Actions for selected rows">
            <span>@selectedPeople.Count selected</span>
            <AppButton OnClick="ExportSelected">Export selected</AppButton>
            <AppButton Variant="AppButtonVariant.Danger"
                       OnClick="DeleteSelected">
                Delete selected
            </AppButton>
        </div>
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
