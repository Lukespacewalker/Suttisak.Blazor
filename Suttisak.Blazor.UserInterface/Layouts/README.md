# Application layouts

`Layouts.Shared.MainLayoutV2` composes the public `ApplicationShellV2` used by the
application family. Consuming applications provide product-owned
content through the existing header, navigation, message, breadcrumb, and page
title sections.

The shell provides:

- a keyboard-visible skip link and semantic `main` region;
- stable header, navigation, feedback, breadcrumb, heading, and body slots;
- shared responsive scrolling and glass-surface behavior;
- an explicit `.app-page` contract for padding and focus rather than selectors
  that depend on a particular DOM hierarchy.

Applications should inherit `Layouts.Shared.MainLayoutV2` and should not recreate
the outer shell. Pages provide headings through `CommonSections.PageTitle` and
place inline application feedback in `MainLayout.MessageBarSection`.

## ApplicationShellV2

`ApplicationShellV2` is the current application shell. The former V1 shell and
layout were removed after every consuming application migrated. The shell owns responsive structure only; the application continues
to own its logo, routes, localized labels, preference behavior, and profile UI.

```razor
<ApplicationShellV2>
    <Brand>@* product logo and name *@</Brand>
    <Navigation>@* application NavLinks *@</Navigation>
    <ThemeSwitcher><ThemeSelector /></ThemeSwitcher>
    <LanguageSwitcher><CultureSelector /></LanguageSwitcher>
    <Profile>@* authenticated profile control *@</Profile>
    <PageHeader>
        <PageHeading Title="Participants">...</PageHeading>
    </PageHeader>
    <ChildContent>@Body</ChildContent>
</ApplicationShellV2>
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

`PageBreadcrumbs` sends page-owned data to `MainLayoutV2`. The layout is the only
breadcrumb renderer, while `ApplicationShellV2` owns the breadcrumb `nav`
landmark. `AppBreadcrumb` renders only its ordered list, treats the last item
as the current page, removes its link, and applies `aria-current="page"`.
Applications remain responsible for localizing breadcrumb titles and can
configure `BreadcrumbLabel` and `SkipLinkText` through `BlazorUIOptions`.
