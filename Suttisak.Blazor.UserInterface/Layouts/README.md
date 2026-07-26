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
