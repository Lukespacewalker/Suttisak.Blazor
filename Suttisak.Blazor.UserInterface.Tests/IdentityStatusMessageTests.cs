using System.Globalization;
using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
using Suttisak.Blazor.Identity.Components.Identity;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class IdentityStatusMessageTests
{
    [Theory]
    [InlineData("en-US", "Error: Invalid login attempt.", "Error")]
    [InlineData("th-TH", "ข้อผิดพลาด: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "ข้อผิดพลาด")]
    public void Explicit_error_intent_preserves_localized_text_and_announces_an_error(string culture, string message, string title)
    {
        using var context = new BunitContext();
        var previousCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo(culture);
            var cut = Render(context, new DefaultHttpContext(), message, FeedbackIntent.Error);

            Assert.NotNull(cut.Find(".feedback-banner--error[role='alert'][aria-live='assertive']"));
            Assert.Equal(title, cut.Find(".feedback-banner strong").TextContent);
            Assert.Equal(message, cut.Find(".feedback-banner__content").TextContent.Trim());
            Assert.Empty(cut.FindAll(".feedback-banner--success"));
        }
        finally
        {
            CultureInfo.CurrentUICulture = previousCulture;
        }
    }

    [Fact]
    public void An_explicit_success_intent_takes_precedence_over_the_legacy_error_prefix()
    {
        using var context = new BunitContext();
        var cut = Render(context, new DefaultHttpContext(), "Error prefix belongs to the message text.", FeedbackIntent.Success);

        Assert.NotNull(cut.Find(".feedback-banner--success[role='status'][aria-live='polite']"));
        Assert.Empty(cut.FindAll(".feedback-banner--error"));
    }

    [Theory]
    [InlineData(FeedbackIntent.Info, "info")]
    [InlineData(FeedbackIntent.Warning, "warning")]
    public void Other_explicit_intents_do_not_infer_a_success_or_error_heading(FeedbackIntent intent, string cssIntent)
    {
        using var context = new BunitContext();
        var cut = Render(context, new DefaultHttpContext(), "Account information.", intent);

        Assert.NotNull(cut.Find($".feedback-banner--{cssIntent}[role='status']"));
        Assert.Empty(cut.FindAll(".feedback-banner strong"));
        Assert.Equal("Account information.", cut.Find(".feedback-banner__content").TextContent.Trim());
    }

    [Fact]
    public void No_explicit_intent_preserves_the_legacy_English_error_classification()
    {
        using var context = new BunitContext();
        var cut = Render(context, new DefaultHttpContext(), "Error: Invalid login attempt.");

        Assert.NotNull(cut.Find(".feedback-banner--error[role='alert']"));
    }

    [Theory]
    [InlineData("en-US", "Success")]
    [InlineData("th-TH", "สำเร็จ")]
    public void No_local_message_or_intent_preserves_the_success_cookie_and_consumes_it(string culture, string title)
    {
        using var context = new BunitContext();
        var http = new DefaultHttpContext();
        http.Request.Headers.Cookie = "Identity.StatusMessage=Account-updated";
        var previousCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo(culture);
            var cut = Render(context, http);

            Assert.NotNull(cut.Find(".feedback-banner--success[role='status'][aria-live='polite']"));
            Assert.Equal(title, cut.Find(".feedback-banner strong").TextContent);
            Assert.Equal("Account-updated", cut.Find(".feedback-banner__content").TextContent.Trim());
            Assert.Contains("Identity.StatusMessage=;", http.Response.Headers.SetCookie.ToString());
        }
        finally
        {
            CultureInfo.CurrentUICulture = previousCulture;
        }
    }

    private static IRenderedComponent<CascadingValue<HttpContext>> Render(BunitContext context, HttpContext http, string? message = null, FeedbackIntent? intent = null) =>
        context.Render<CascadingValue<HttpContext>>(parameters => parameters
            .Add(component => component.Value, http)
            .Add(component => component.ChildContent, builder =>
            {
                builder.OpenComponent<StatusMessage>(0);
                builder.AddAttribute(1, nameof(StatusMessage.Message), message);
                if (intent is not null) builder.AddAttribute(2, "Intent", intent.Value);
                builder.CloseComponent();
            }));
}
