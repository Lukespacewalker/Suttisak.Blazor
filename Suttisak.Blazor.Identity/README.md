# Suttisak.Blazor.Identity

Reusable Identity pages and presentation components. Applications own authentication
configuration, routes, localization choices, and product content.

## StatusMessage intent (0.9.6)

`Components.Identity.StatusMessage` accepts an optional nullable `FeedbackIntent`
through `Intent`. Set it explicitly for localized feedback instead of inferring
severity from message text:

```razor
<StatusMessage Message="@LocalizedError" Intent="FeedbackIntent.Error" />
```

Explicit intent controls the banner style and live-region semantics. Error and
Success use the existing localized headings; Info and Warning display the message
without an inferred success/error heading. Message text is preserved.

When `Intent` is null, the existing English `Error` prefix classification remains.
When `Message` is null, the component still reads and consumes the one-time
`Identity.StatusMessage` cookie. Login supplies Error only for a nonempty local
failure message, leaving cookie-based success feedback on the default path.
