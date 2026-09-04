# Data grid action placement

Use action placement to communicate scope. Do not choose between row actions and selection actions as a visual preference; they solve different tasks.

## Canonical rule

- **Grid-level actions** belong in the grid command bar: search, filters, create, refresh, column settings, and export of the current view.
- **Single-record actions** belong with the row. A frequent primary action may be inline. Secondary or destructive actions belong in `AppActionMenu`.
- **Multi-record actions** require `AppGridSelectionMode.Multiple` and belong in `AppGridSelectionToolbar` through `AppGridShell.SelectionToolbar`.
- The contextual selection toolbar **replaces** the normal grid toolbar while one or more rows are selected. Do not stack both toolbars.

## Row actions

Keep the row surface quiet. Prefer a record link for opening details, at most one frequent inline action, then an overflow menu for secondary actions.

```razor
<AppGridTemplateColumn TGridItem="Person" Title="Actions">
    <AppButton Variant="AppButtonVariant.Subtle"
               Size="AppButtonSize.Compact"
               OnClick="@(_ => Edit(context))">
        Edit
    </AppButton>
    <AppActionMenu AriaLabel="@($"More actions for {context.Name}")">
        <AppButton Variant="AppButtonVariant.Danger"
                   Size="AppButtonSize.Compact"
                   OnClick="@(_ => Delete(context))">
            Delete
        </AppButton>
    </AppActionMenu>
</AppGridTemplateColumn>
```

Do not repeat a bank of `View / Edit / Copy / Delete / Download` buttons in every row. Move secondary actions into the overflow menu.

## Batch actions

Enable multiple selection only when the product has meaningful actions that can operate on several rows. Bind selection and expose actions only after selection exists.

```razor
<AppGridShell AriaLabel="People"
              SelectionActive="@(selectedPeople.Count > 0)">
    <Toolbar>
        <span>@people.Count records</span>
    </Toolbar>

    <SelectionToolbar>
        <AppGridSelectionToolbar SelectedCount="@selectedPeople.Count"
                                 OnClear="ClearSelection">
            <Actions>
                <AppButton OnClick="ExportSelected">Export selected</AppButton>
                <AppButton Variant="AppButtonVariant.Danger"
                           OnClick="DeleteSelected">
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

## Single selection

Use `AppGridSelectionMode.Single` for selection itself as part of the task, such as a master-detail workspace, inspector pane, comparison target, or another workflow where the selected row drives adjacent content.

Do **not** require `select row -> toolbar -> Edit` for ordinary editing when the same action can be reached directly from the row. That adds interaction without adding scope or safety.

The header select-all checkbox is intentionally available only in `Multiple` mode.

## Interaction separation

Checkbox selection, record navigation, and row controls must remain separate interactions.

Interactive content inside a row (`a`, `button`, `input`, `select`, `textarea`, `summary`, button roles, and editable content) must not toggle row selection. `blazor-utilities.js` enforces this contract for `AppGrid`.

## Decision table

| Action | Placement |
| --- | --- |
| Open details | Primary cell link or dedicated row action |
| Edit one record | Inline row action when frequent, otherwise `AppActionMenu` |
| Delete one record | `AppActionMenu` + confirmation |
| Export current filtered view | Grid command bar |
| Export selected rows | Selection toolbar |
| Delete selected rows | Selection toolbar + confirmation |
| Change status for several rows | Selection toolbar |
| Create record | Page/grid command bar |
| Search, filter, refresh, columns | Grid command bar |

The Playbook `AppGrid` specimen and `/application-shell/records` route are the canonical executable examples for this policy.
