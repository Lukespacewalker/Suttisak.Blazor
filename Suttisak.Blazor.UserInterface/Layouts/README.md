# Application layouts

`Layouts.Shared.MainLayout` composes the public `ApplicationShell` used by the
application family. Consuming applications continue to provide product-owned
content through the existing header, navigation, message, breadcrumb, and page
title sections.

The shell provides:

- a keyboard-visible skip link and semantic `main` region;
- stable header, navigation, feedback, breadcrumb, heading, and body slots;
- shared responsive scrolling and glass-surface behavior;
- an explicit `.app-page` contract for padding and focus rather than selectors
  that depend on a particular DOM hierarchy.

Applications should inherit `Layouts.Shared.MainLayout` and should not recreate
the outer shell. Pages provide headings through `CommonSections.PageTitle` and
place inline application feedback in `MainLayout.MessageBarSection`.

## Breadcrumbs

Use data-driven breadcrumbs instead of page-owned `FluentBreadcrumb` markup.
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
breadcrumb renderer, while `ApplicationShell` owns the breadcrumb `nav`
landmark. `AppBreadcrumb` renders only its ordered list, treats the last item
as the current page, removes its link, and applies `aria-current="page"`.
Applications remain responsible for localizing breadcrumb titles and can
configure `BreadcrumbLabel` and `SkipLinkText` through `BlazorUIOptions`.
