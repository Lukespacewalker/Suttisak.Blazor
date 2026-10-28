using System.Globalization;
using System.Security.Claims;
using Bunit;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using OptionsFactory = Microsoft.Extensions.Options.Options;
using Suttisak.Blazor.Identity;
using Suttisak.Blazor.Identity.Pages.Identity;
using Suttisak.Blazor.Identity.Pages.Identity.Manage;
using Suttisak.Blazor.UserInterface.Layouts.Shared;
using Suttisak.Blazor.UserInterface.Services;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class IdentityPresentationQualityTests
{
    [Theory]
    [InlineData(true, "/Account/Manage/ChangePassword")]
    [InlineData(false, "/Account/Manage/SetPassword")]
    public void Overview_uses_shared_button_links_and_preserves_password_dependent_navigation(bool hasPassword, string passwordRoute)
    {
        using var context = CreateManagementContext(hasPassword);
        var cut = Render(context, typeof(Manage<IdentityUser>), new DefaultHttpContext());

        Assert.Equal(new[]
        {
            "/Account/Manage/Email", passwordRoute, "/Account/Manage/TwoFactorAuthentication",
            "/Account/Manage/Passkeys", "/Account/Manage/ExternalLogins", "/Account/Manage/PersonalData"
        }, cut.FindAll(".identity-setting-card__actions > a.app-button--secondary").Select(link => link.GetAttribute("href")));
        Assert.Empty(cut.FindAll(".identity-setting-card__actions button, .identity-setting-card__actions form"));
    }

    [Fact]
    public void Personal_data_keeps_download_as_a_post_form_and_deletion_as_a_danger_navigation_link()
    {
        using var context = CreateManagementContext();
        var cut = Render(context, typeof(PersonalData<IdentityUser>), new DefaultHttpContext());

        Assert.Equal("/Account/Manage/DeletePersonalData", cut.Find(".identity-setting-card__actions > a.app-button--danger").GetAttribute("href"));
        var download = Assert.Single(cut.FindAll(".identity-setting-card__actions form"));
        Assert.Equal("Account/Manage/DownloadPersonalData", download.GetAttribute("action"));
        Assert.Equal("post", download.GetAttribute("method"));
        Assert.Equal("submit", download.QuerySelector("button.app-button--secondary")!.GetAttribute("type"));
    }

    [Fact]
    public void Two_factor_actions_keep_native_navigation_and_the_separate_forget_browser_post_form()
    {
        using var context = CreateManagementContext();
        var cut = Render(context, typeof(TwoFactorAuthentication<IdentityUser>), new DefaultHttpContext());

        Assert.Equal(new[]
        {
            "/Account/Manage/GenerateRecoveryCodes", "/Account/Manage/DisableTwoFactorAuthentication",
            "/Account/Manage/EnableAuthenticator", "/Account/Manage/ResetAuthenticator"
        }, cut.FindAll(".identity-setting-card__actions > a.app-button").Select(link => link.GetAttribute("href")));
        Assert.Equal("/Account/Manage/DisableTwoFactorAuthentication", cut.Find(".identity-setting-card__actions > a.app-button--danger").GetAttribute("href"));
        var forgetBrowser = Assert.Single(cut.FindAll(".identity-setting-card__actions form"));
        Assert.Equal("post", forgetBrowser.GetAttribute("method"));
        Assert.Equal("submit", forgetBrowser.QuerySelector("button.app-button--secondary")!.GetAttribute("type"));
    }

    [Theory]
    [InlineData(typeof(AccessDenied), "en-US", "Access denied", "You do not have access to this resource.")]
    [InlineData(typeof(AccessDenied), "th-TH", "การเข้าถึงถูกปฏิเสธ", "คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้")]
    [InlineData(typeof(Lockout), "en-US", "Locked out", "This account has been locked out, please try again later.")]
    [InlineData(typeof(Lockout), "th-TH", "ถูกล็อค", "บัญชีนี้ถูกล็อค โปรดลองอีกครั้งในภายหลัง")]
    public void Failure_screen_has_one_heading_and_one_assertive_message_without_an_inner_card(Type screen, string culture, string title, string message)
    {
        using var context = CreateContext();
        var previousCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo(culture);
            var cut = Render(context, screen, new DefaultHttpContext());

            Assert.Equal(title, Assert.Single(cut.FindAll("main h1, main h2")).TextContent);
            Assert.Single(cut.FindAll("main p"), paragraph => paragraph.TextContent == message);
            Assert.Equal(message, cut.Find(".identity-flow-panel > [role='alert'][aria-live='assertive']").TextContent.Trim());
            Assert.Empty(cut.FindAll(".identity-flow-panel .status-panel"));
        }
        finally
        {
            CultureInfo.CurrentUICulture = previousCulture;
        }
    }

    [Theory]
    [InlineData("en-US", "Invalid user", "Error: Unable to load the current account.")]
    [InlineData("th-TH", "ผู้ใช้ไม่ถูกต้อง", "ข้อผิดพลาด: ไม่สามารถโหลดบัญชีปัจจุบันได้")]
    public void Invalid_user_keeps_cookie_feedback_in_the_alert_body_and_consumes_the_cookie(string culture, string title, string message)
    {
        using var context = CreateContext();
        var http = new DefaultHttpContext();
        http.Request.Headers.Cookie = $"Identity.StatusMessage={Uri.EscapeDataString(message)}";
        var previousCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo(culture);
            var cut = Render(context, typeof(InvalidUser), http);

            Assert.Equal(title, Assert.Single(cut.FindAll("main h1, main h2")).TextContent);
            Assert.Equal(message, cut.Find(".identity-flow-panel > [role='alert'][aria-live='assertive'] .feedback-banner__content").TextContent.Trim());
            Assert.Empty(cut.FindAll(".status-panel, .status-panel__actions"));
            Assert.Contains("Identity.StatusMessage=;", http.Response.Headers.SetCookie.ToString());
        }
        finally
        {
            CultureInfo.CurrentUICulture = previousCulture;
        }
    }

    private static BunitContext CreateContext()
    {
        var context = new BunitContext();
        context.Services.AddLocalization();
        context.Services.AddOptions<BlazorUIOptions>();
        return context;
    }

    private static BunitContext CreateManagementContext(bool hasPassword = true)
    {
        var context = CreateContext();
        var userManager = new PresentationUserManager { HasPassword = hasPassword };
        context.Services.AddSingleton<UserManager<IdentityUser>>(userManager);
        context.Services.AddSingleton<SignInManager<IdentityUser>>(new PresentationSignInManager(userManager));
        context.Services.AddSingleton<IdentityRedirectManager>(services => new IdentityRedirectManager<IdentityUser>(services.GetRequiredService<NavigationManager>()));
        context.Services.AddSingleton<IdentityUserAccessor<IdentityUser>>();
        return context;
    }

    private static IRenderedComponent<CascadingValue<HttpContext>> Render(BunitContext context, Type screen, HttpContext http) =>
        context.Render<CascadingValue<HttpContext>>(parameters => parameters
            .Add(component => component.Value, http)
            .Add(component => component.ChildContent, builder =>
            {
                builder.OpenComponent<IdentityLayout>(0);
                builder.AddAttribute(1, nameof(IdentityLayout.Body), (RenderFragment)(body =>
                {
                    body.OpenComponent(0, screen);
                    body.CloseComponent();
                }));
                builder.CloseComponent();
            }));

    // Only the external account lookups are replaced; the real page, layout, cards,
    // links, forms and feedback render through their production components.
    private sealed class PresentationUserManager() : UserManager<IdentityUser>(
        new UnusedUserStore(), null!, null!, null!, null!, null!, null!, null!, NullLogger<UserManager<IdentityUser>>.Instance)
    {
        public bool HasPassword { get; init; }
        public override Task<IdentityUser?> GetUserAsync(ClaimsPrincipal principal) => Task.FromResult<IdentityUser?>(new IdentityUser("presentation-user"));
        public override Task<bool> IsEmailConfirmedAsync(IdentityUser user) => Task.FromResult(true);
        public override Task<bool> HasPasswordAsync(IdentityUser user) => Task.FromResult(HasPassword);
        public override Task<bool> GetTwoFactorEnabledAsync(IdentityUser user) => Task.FromResult(true);
        public override Task<IList<UserPasskeyInfo>> GetPasskeysAsync(IdentityUser user) => Task.FromResult<IList<UserPasskeyInfo>>([]);
        public override Task<IList<UserLoginInfo>> GetLoginsAsync(IdentityUser user) => Task.FromResult<IList<UserLoginInfo>>([]);
        public override Task<string?> GetAuthenticatorKeyAsync(IdentityUser user) => Task.FromResult<string?>("presentation-key");
        public override Task<int> CountRecoveryCodesAsync(IdentityUser user) => Task.FromResult(5);
    }

    private sealed class PresentationSignInManager(UserManager<IdentityUser> userManager) : SignInManager<IdentityUser>(
        userManager, new HttpContextAccessor(), new UserClaimsPrincipalFactory<IdentityUser>(userManager, OptionsFactory.Create(new IdentityOptions())),
        OptionsFactory.Create(new IdentityOptions()), NullLogger<SignInManager<IdentityUser>>.Instance,
        new AuthenticationSchemeProvider(OptionsFactory.Create(new AuthenticationOptions())), new DefaultUserConfirmation<IdentityUser>())
    {
        public override Task<bool> IsTwoFactorClientRememberedAsync(IdentityUser user) => Task.FromResult(true);
    }

    private sealed class UnusedUserStore : IUserStore<IdentityUser>
    {
        public void Dispose() { }
        public Task<string> GetUserIdAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<string?> GetUserNameAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task SetUserNameAsync(IdentityUser user, string? userName, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<string?> GetNormalizedUserNameAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task SetNormalizedUserNameAsync(IdentityUser user, string? normalizedName, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IdentityResult> CreateAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IdentityResult> UpdateAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IdentityResult> DeleteAsync(IdentityUser user, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IdentityUser?> FindByIdAsync(string userId, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<IdentityUser?> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken) => throw new NotSupportedException();
    }
}
