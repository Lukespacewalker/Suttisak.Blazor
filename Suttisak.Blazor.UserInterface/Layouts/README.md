# Application layouts

## Login presentation

From UI 1.0.33, a login-specific host layout can inherit `IdentityLayout` and
enable the full-page `AccessPageLayout` composition. Other identity routes retain
the default layout.

```razor
@inherits Suttisak.Blazor.UserInterface.Layouts.Shared.IdentityLayout

@{ base.BuildRenderTree(__builder); }

@code {
    protected override bool LoginPresentation => true;
    protected override string HeadingId => "workspace-login-title";
    protected override string ShowcaseLabel => "Workspace introduction";
    // Override HeaderRenderMode only when the host requires an interactive boundary.
}
```

The page or host supplies `CardEyebrowSection` for the card brand,
`CardKickerSection` for the login `h1`, `CardIntroSection` for its introduction,
and `ShowcaseSection` for application-owned media and copy. Optional
`ShowcaseBrandSection`, `HeaderActionsSection`, `SupportingContentSection`, and
`FooterSection` fill the additional login slots. Supply a localized heading and
showcase label; use `h2` for the showcase heading. The host owns routes, account
links, imagery, authentication, and localization. Existing `HeaderRenderMode`
continues to control the compact `PreferencesSelector` render boundary.

For direct composition, `AccessPageLayout` exposes these as `Brand`, `Title`,
`Intro`, `Showcase`, `ShowcaseBrand`, `HeaderActions`, `SupportingContent`, and
`Footer`, with the form in `ChildContent`. `LoginPresentation` defaults to false;
the older `IdentityLayout` section mapping and general access presentation remain
available. This opt-in login composition supersedes earlier login geometry only
where explicitly enabled. Playbook's `access/shared-login` route demonstrates
the public slots, compact preferences, and `AlternativeAccessGroup` action tiles.

## MainLayout

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
navigation remains expanded initially and can be collapsed from the header.
Nexora uses the existing panel-contract and panel-expand icons on desktop;
its mobile menu still changes between hamburger and close states. Other
appearances retain their existing desktop menu symbol. Desktop collapse
and mobile drawer state are independent so resizing does not leave the mobile
navigation unexpectedly open.
Escape dismisses an open mobile navigation drawer when keyboard focus is inside
it and restores focus to its menu button. A nested native popover or dialog owns
its own Escape, and desktop navigation is unaffected.

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

From UI 1.0.31, Nexora renders breadcrumbs and both heading components directly
on the page background. The title has a stronger desktop hierarchy, then adapts
to the available parent width so actions and useful task content remain visible
on tablets and narrow previews. Header scheme/language buttons use quiet chrome
with an explicit selected state and keyboard focus. This is an appearance-only
treatment; shell slots, IDs, preference behavior, and public parameters remain
unchanged.
