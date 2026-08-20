# Navigation components

## Primary navigation

Compose application navigation from `NavGroup`, `NavItem`, and `NavSubmenu`.
The application owns labels, routes, authorization, badges, and footer content;
the shared components own spacing, hierarchy, active states, and responsive
behavior.

```razor
<Nav Embedded="true" AccountLabel="Account">
    <ChildContent>
        <NavGroup Label="Workspace">
            <NavItem Href="/" Match="NavLinkMatch.All"
                     IconRestName="Home" IconActiveName="Home">Overview</NavItem>
            <NavItem Href="/records" IconRestName="Table" IconActiveName="Table">
                <ChildContent>Records</ChildContent>
                <TrailingContent>@RecordCount</TrailingContent>
            </NavItem>
        </NavGroup>
        <NavGroup Label="Manage">
            <NavSubmenu Label="Administration" IconName="Settings">
                <NavItem Href="/admin/users" IconRestName="People">Users</NavItem>
                <NavItem Href="/admin/roles" IconRestName="PersonLock">Roles</NavItem>
            </NavSubmenu>
        </NavGroup>
    </ChildContent>
    <AccountContent>@* application-owned account destinations *@</AccountContent>
</Nav>
```

Use `NavItem.TrailingContent` for compact counts or status badges. Use
`MainLayout.NavigationFooterSection` for product-owned status, help, or
environment information. Do not recreate navigation group, item, or active-state
CSS in consuming applications or the Playbook.

## NavSubmenu

Use `NavSubmenu` for a collapsible group inside the primary side navigation.
Set `Active` when any descendant route is active and `Expanded` when the group
should start open. It uses native `details` and `summary`, so pointer and keyboard
interaction also work during static server rendering.

```razor
<NavSubmenu Label="Administration"
            IconName="Settings"
            Active="@IsAdministrationRoute"
            Expanded="@IsAdministrationRoute">
    <NavItem Href="admin/users" IconRestName="People">Users</NavItem>
    <NavItem Href="admin/roles" IconRestName="PersonLock">Roles</NavItem>
</NavSubmenu>
```

Keep nesting to one submenu level. For sibling views of the current record or
person, use `SectionNavigation` instead.

## SectionNavigation

Use `SectionNavigation` inside an application page when the primary application
navigation already identifies the product area and the user needs to move among
views of one account, participant, case, or other current context.

```razor
<SectionNavigation AriaLabel="Participant sections" Embedded="true">
    <ChildContent>
        <NavLink href="participants/42" Match="NavLinkMatch.All">Overview</NavLink>
        <NavLink href="participants/42/results">Results</NavLink>
        <NavLink href="participants/42/documents">Documents</NavLink>
    </ChildContent>
    <Overflow>
        <NavLink href="participants/42/appointments">Appointments</NavLink>
        <NavLink href="participants/42/audit">Audit history</NavLink>
    </Overflow>
</SectionNavigation>
```

Set `Embedded="true"` when the navigation is supplied through
`PageHeading.Navigation`. In that composition the heading owns the outer
surface, section identity, and section-level actions, while
`SectionNavigation` renders only the sibling destinations.

Keep global destinations in `ApplicationShell.Navigation`. Keep only sibling
views of the current entity in `SectionNavigation`; do not repeat the primary
navigation. The application owns routes, localized labels, icons, and actions.
In the standard composition, put the current entity in
`PageHeading.SectionTitle`, context-level actions in
`PageHeading.SectionActions`, and current-page actions in
`PageHeading.PageActions`. On narrow containers the navigation becomes one
current-section menu rather than a second drawer or sidebar.

For more than seven sibling views, keep the highest-frequency destinations in
`ChildContent` and move the rest to `Overflow`. Overflow destinations remain
inline while every item fits; the component reveals the native **More** menu
only when its measured container runs out of room. Set `OverflowActive="true"`
and change `OverflowLabel` to the active destination when the current route is
inside the overflow menu, so the selected section remains visible. At narrow
container widths the component replaces the horizontal rail with one current-
section trigger and renders both fragments in a scrollable menu. Both menus use
native `details` and `summary`, so they remain operable during static SSR before
Blazor interactivity is available.
`NavItem` accepts `IconRestName` and `IconActiveName` for
icons from `Suttisak.Blazor.Icons`. Use the same semantic name for both states
unless a filled active state adds useful meaning; selection itself is already
communicated by the active menu style and `aria-current`.
