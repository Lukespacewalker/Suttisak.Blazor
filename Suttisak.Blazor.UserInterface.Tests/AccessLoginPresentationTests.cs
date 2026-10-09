using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Sections;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components;
using Suttisak.Blazor.UserInterface.Layouts.Shared;
using Suttisak.Blazor.UserInterface.Services;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class AccessLoginPresentationTests
{
    private static RenderFragment Markup(string html) => builder => builder.AddMarkupContent(0, html);
    private static IRenderedComponent<T> Render<T>(BunitContext context, params (string Name, object Value)[] parameters) where T : IComponent =>
        context.Render<T>(builder =>
        {
            builder.OpenComponent<T>(0);
            foreach (var (name, value) in parameters) builder.AddAttribute(1, name, value);
            builder.CloseComponent();
        });

    [Fact]
    public void Login_presentation_composes_application_content_with_one_labelled_main_and_heading()
    {
        using var context = new BunitContext();
        var cut = Render<AccessPageLayout>(context,
            ("LoginPresentation", true),
            ("HeadingId", "example-sign-in"),
            ("ShowcaseLabel", "Example welcome"),
            ("Brand", Markup("<a href='/'>Example</a>")),
            ("Title", Markup("Welcome back")),
            ("Intro", Markup("Use your account")),
            ("Controls", Markup("<button>Language</button>")),
            ("ChildContent", Markup("<form><label>Email<input autocomplete='username'></label></form>")),
            ("Showcase", Markup("<picture><img src='/example.webp' alt=''></picture><h2>Example welcome</h2>")),
            ("ShowcaseBrand", Markup("<a href='/'>Example brand</a>")),
            ("HeaderActions", Markup("<a href='/register'>Create account</a>")),
            ("SupportingContent", Markup("Take your time")),
            ("Footer", Markup("<footer>Example credits</footer>")));

        Assert.Single(cut.FindAll("main"));
        Assert.Single(cut.FindAll("h1"));
        Assert.Equal("access-login-panel", cut.Find("main > :first-child").ClassName);
        Assert.Equal("H1", cut.Find("h1, h2").TagName);
        Assert.Equal("Welcome back", cut.Find("h1").TextContent);
        Assert.Equal("example-sign-in", cut.Find(".access-login-panel").GetAttribute("aria-labelledby"));
        Assert.Equal("Example welcome", cut.Find("aside").GetAttribute("aria-label"));
        Assert.Equal("/example.webp", cut.Find("aside img").GetAttribute("src"));
        Assert.Contains("Example brand", cut.Find(".access-login-showcase-brand").TextContent);
        Assert.Contains("Create account", cut.Find(".access-login-topbar").TextContent);
        Assert.Contains("Take your time", cut.Find(".access-login-support").TextContent);
        Assert.Contains("Example credits", cut.Find(".access-login-footer").TextContent);
        Assert.Single(cut.FindAll("footer"));
    }

    [Fact]
    public void Missing_optional_login_content_does_not_leave_empty_regions()
    {
        using var context = new BunitContext();
        var cut = Render<AccessPageLayout>(context,
            ("LoginPresentation", true),
            ("Title", Markup("Sign in")),
            ("ChildContent", Markup("Account form")),
            ("Showcase", Markup("Welcome")));

        Assert.Empty(cut.FindAll(".access-login-topbar, .access-login-support, .access-login-footer, .access-login-showcase-brand"));
        Assert.Single(cut.FindAll("main"));
    }

    [Fact]
    public void Existing_access_presentation_retains_its_heading_and_card_composition()
    {
        using var context = new BunitContext();
        var cut = context.Render<AccessPageLayout>(parameters => parameters
            .Add(component => component.Title, Markup("Register"))
            .Add(component => component.Kicker, Markup("Create account"))
            .Add(component => component.ChildContent, Markup("Registration form"))
            .Add(component => component.Showcase, Markup("Welcome")));

        Assert.NotNull(cut.Find(".access-page-layout__grid > .access-page-layout__card"));
        Assert.Equal("Register", cut.Find("h1").TextContent);
        Assert.Empty(cut.FindAll(".access-login-panel"));
    }

    [Theory]
    [InlineData("Other ways to sign in")]
    [InlineData("วิธีอื่นในการเข้าสู่ระบบ")]
    public void Alternative_access_group_preserves_native_provider_and_passkey_forms(string label)
    {
        using var context = new BunitContext();
        var cut = Render<AlternativeAccessGroup>(context,
            ("Label", label),
            ("ChildContent", Markup("""
                <div class="login-provider-block">
                    <form action="/Identity/PerformExternalLogin" method="post">
                        <input type="hidden" name="__RequestVerificationToken" value="provider-token">
                        <input type="hidden" name="ReturnUrl" value="/workspace">
                        <button type="submit" name="provider" value="Microsoft">Microsoft</button>
                    </form>
                </div>
                <form method="post" data-form-name="LoginWithPasskey">
                    <input type="hidden" name="__RequestVerificationToken" value="passkey-token">
                    <button type="submit" name="__passkeySubmit">Continue with passkey</button>
                    <passkey-submit operation="Request" name="LoginWithPasskeyOutput"></passkey-submit>
                </form>
                """)));

        Assert.Equal(label, cut.Find("[role='group']").GetAttribute("aria-label"));
        var forms = cut.FindAll("form");
        Assert.Equal(2, forms.Count);
        Assert.All(forms, form => Assert.Equal("post", form.GetAttribute("method")));
        Assert.Equal("/Identity/PerformExternalLogin", forms[0].GetAttribute("action"));
        Assert.Equal("/workspace", forms[0].QuerySelector("[name='ReturnUrl']")!.GetAttribute("value"));
        Assert.Equal("LoginWithPasskey", forms[1].GetAttribute("data-form-name"));
        Assert.Equal("LoginWithPasskeyOutput", forms[1].QuerySelector("passkey-submit")!.GetAttribute("name"));
        Assert.Equal(new[] { "provider-token", "passkey-token" },
            cut.FindAll("[name='__RequestVerificationToken']").Select(input => input.GetAttribute("value")));
        var buttons = cut.FindAll("button");
        Assert.Equal(new[] { "provider", "__passkeySubmit" }, buttons.Select(button => button.GetAttribute("name")));
        Assert.Same(forms[0], buttons[0].Closest("form"));
        Assert.Same(forms[1], buttons[1].Closest("form"));
    }

    [Fact]
    public void Compact_preferences_keep_separate_keyboard_disclosures_and_existing_culture_theme_controls()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var cut = Render<PreferencesSelector>(context, ("Compact", true));

        Assert.Equal(2, cut.FindAll("details > summary[aria-label]").Count);
        Assert.Single(cut.FindAll(".culture-selector"));
        Assert.Single(cut.FindAll("[data-theme-selector]"));
        Assert.Empty(cut.FindAll("select"));
        Assert.Equal(3, cut.FindAll("[data-theme-preference]").Count);
    }

    [Fact]
    public void Compact_preferences_reuse_host_content_and_labels_without_rendering_header_popovers()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>().Configure(options => options.CompactHeaderPreferences = true);
        var cut = Render<PreferencesSelector>(context,
            ("Compact", true),
            ("HeaderThemeLabel", "Screen colors"),
            ("HeaderLanguageLabel", "Workspace language"),
            ("ThemeContent", Markup("<button>Choose colors</button>")),
            ("LanguageContent", Markup("<button>Choose language</button>")));

        Assert.Equal("Screen colors", cut.Find("[data-login-preference='color'] summary").GetAttribute("aria-label"));
        Assert.Equal("Workspace language", cut.Find("[data-login-preference='language'] summary").GetAttribute("aria-label"));
        Assert.Equal(2, cut.FindAll("button").Count);
        Assert.Empty(cut.FindAll("[popover], .preferences-selector__desktop, .preferences-selector__mobile"));
    }

    [Fact]
    public void Compact_preference_disclosures_are_grouped_per_selector_instance()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var first = Render<PreferencesSelector>(context, ("Compact", true));
        var second = Render<PreferencesSelector>(context, ("Compact", true));

        Assert.Equal(first.Find("details").GetAttribute("name"), first.FindAll("details")[1].GetAttribute("name"));
        Assert.NotEqual(first.Find("details").GetAttribute("name"), second.Find("details").GetAttribute("name"));
    }

    [Fact]
    public void Derived_identity_login_layout_maps_sections_and_protected_overrides()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var cut = Render<LoginIdentityLayout>(context, ("Body", IdentityPageContent()));

        Assert.Equal("Welcome back", cut.Find("h1").TextContent);
        Assert.Equal("test-login-heading", cut.Find("h1").Id);
        Assert.Equal("Workspace welcome", cut.Find("aside").GetAttribute("aria-label"));
        Assert.Contains("Card brand", cut.Find(".access-login-brand").TextContent);
        Assert.Contains("Showcase brand", cut.Find(".access-login-showcase-brand").TextContent);
        Assert.Contains("Create account", cut.Find(".access-login-topbar").TextContent);
        Assert.Contains("Supporting copy", cut.Find(".access-login-support").TextContent);
        Assert.Contains("Organization footer", cut.Find(".access-login-footer").TextContent);
        Assert.Contains("Recover account", cut.Find(".access-login-body .login-footer").TextContent);
        Assert.Equal(2, cut.FindAll("[data-login-preference]").Count);
        Assert.Empty(cut.FindAll(".access-login-kicker"));
    }

    [Fact]
    public void Default_identity_layout_retains_the_legacy_title_and_kicker_sections()
    {
        using var context = new BunitContext();
        context.Services.AddOptions<BlazorUIOptions>();
        var cut = Render<IdentityLayout>(context, ("Body", IdentityPageContent()));

        Assert.Equal("Sign in", cut.Find("h1").TextContent);
        Assert.Equal("Welcome back", cut.Find(".access-page-layout__kicker").TextContent);
        Assert.Empty(cut.FindAll(".access-login-layout, [data-login-preference]"));
    }

    private static RenderFragment IdentityPageContent() => builder =>
    {
        (object Section, string Content)[] sections =
        [
            (IdentityLayout.CardEyebrowSection, "Card brand"),
            (IdentityLayout.CardTitleSection, "Sign in"),
            (IdentityLayout.CardKickerSection, "Welcome back"),
            (IdentityLayout.CardIntroSection, "Sign in to continue"),
            (IdentityLayout.ShowcaseSection, "<h2>Welcome to the workspace</h2>"),
            (IdentityLayout.ShowcaseBrandSection, "Showcase brand"),
            (IdentityLayout.HeaderActionsSection, "<a href='/register'>Create account</a>"),
            (IdentityLayout.SupportingContentSection, "Supporting copy"),
            (IdentityLayout.FooterSection, "Organization footer")
        ];
        foreach (var (section, content) in sections)
        {
            builder.OpenComponent<SectionContent>(0);
            builder.AddAttribute(1, nameof(SectionContent.SectionId), section);
            builder.AddAttribute(2, nameof(SectionContent.ChildContent), Markup(content));
            builder.CloseComponent();
        }
        builder.AddMarkupContent(3, "<form>Account form</form><div class='login-footer'><a href='/recover'>Recover account</a></div>");
    };

    public sealed class LoginIdentityLayout : IdentityLayout
    {
        protected override bool LoginPresentation => true;
        protected override string HeadingId => "test-login-heading";
        protected override string ShowcaseLabel => "Workspace welcome";
    }
}
