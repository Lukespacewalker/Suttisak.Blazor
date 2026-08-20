# Application layouts

`Layouts.Shared.MainLayout` composes the public `ApplicationShell` used by the
application family. Consuming applications provide product-owned
content through the existing heading, navigation, message, breadcrumb, and body
sections.

The shell provides:

- a keyboard-visible skip link and semantic `main` region;
- stable header, navigation, feedback, breadcrumb, heading, and body slots;
- shared responsive scrolling and glass-surface behavior;
- an explicit `.app-page` contract for padding and focus rather than selectors
  that depend on a particular DOM hierarchy.

Applications should inherit `Layouts.Shared.MainLayout` and should not recreate
the outer shell. Pages provide headings through `CommonSections.PageHeading` and
place inline application feedback in `MainLayout.MessageBarSection`.

## ApplicationShell

`ApplicationShell` is the current application shell. Earlier versioned shells and
layouts were removed after every consuming application migrated. The shell owns responsive structure only; the application continues
to own its logo, routes, localized labels, preference behavior, and profile UI.

```razor
<ApplicationShell>
    <Brand>@* product logo and name *@</Brand>
    <Navigation>@* application NavLinks *@</Navigation>
    <ThemeSwitcher><ThemeSwitcher /></ThemeSwitcher>
    <LanguageSwitcher><CultureSelector /></LanguageSwitcher>
    <Profile>@* authenticated profile control *@</Profile>
    <Heading>
        <ApplicationPageHeading>
            <PageHeading Title="Participants">...</PageHeading>
        </ApplicationPageHeading>
    </Heading>
    <ChildContent>@Body</ChildContent>
</ApplicationShell>
```

The required `ThemeSwitcher`, `LanguageSwitcher`, and `Profile` slots keep
these application controls in a stable header position without making
the reusable layout depend on authentication or localization services. On
narrow containers the navigation becomes an accessible drawer, theme controls
and language controls move to the top of that drawer, while profile access
remains right-aligned in the header. Navigation closes
automatically after a route change. The component also supports `HeaderActions`
and `NavigationFooter` for application-owned secondary content. On desktop the
navigation remains expanded initially and can be collapsed from the header;
the menu button animates between hamburger and close states. Desktop collapse
and mobile drawer state are independent so resizing does not leave the mobile
navigation unexpectedly open.

## Breadcrumbs

Use data-driven breadcrumbs instead of page-owned breadcrumb markup.
Every page declares `PageBreadcrumbs` with application-owned titles, routes,
and icons:

```razor
<PageBreadcrumbs Items="@breadcrumbs" />

@code {
    private readonly Breadcrumb[] breadcrumbs =
    [
        new(null, "/reports", "Reports"),
        new(null, null, "Monthly report")
    ];
}
```

`PageBreadcrumbs` sends page-owned data to `MainLayout`. The layout is the only
breadcrumb renderer and composes it with the active `PageHeading` or
`ExperienceHeading` through `ApplicationPageHeading`. `AppBreadcrumb` renders only its ordered list, treats the last item
as the current page, removes its link, and applies `aria-current="page"`.
Applications remain responsible for localizing breadcrumb titles and can
configure `BreadcrumbLabel` and `SkipLinkText` through `BlazorUIOptions`.
