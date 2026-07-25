using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

namespace Suttisak.Blazor.Identity.Pages.Identity;

/// <summary>
/// Shared registration workflow. Applications supply only their input model and
/// entity-specific hooks; the Identity lifecycle remains consistent everywhere.
/// </summary>
public abstract class RegistrationPage<TUser, TInput> : ComponentBase
    where TUser : class
    where TInput : new()
{
    [Inject] protected UserManager<TUser> UserManager { get; set; } = null!;
    [Inject] protected IUserStore<TUser> UserStore { get; set; } = null!;
    [Inject] protected SignInManager<TUser> SignInManager { get; set; } = null!;
    [Inject] protected IEmailSender<TUser> EmailSender { get; set; } = null!;
    [Inject] protected ILogger<RegistrationPage<TUser, TInput>> Logger { get; set; } = null!;
    [Inject] protected NavigationManager NavigationManager { get; set; } = null!;
    [Inject] protected IdentityRedirectManager RedirectManager { get; set; } = null!;

    [SupplyParameterFromForm]
    protected TInput Input { get; set; } = new();

    [SupplyParameterFromQuery]
    protected string? ReturnUrl { get; set; }

    protected IEnumerable<IdentityError>? IdentityErrors { get; private set; }
    protected string? StatusMessage => IdentityErrors is null ? null : $"Error: {string.Join(", ", IdentityErrors.Select(error => error.Description))}";

    protected abstract TUser CreateUser();
    protected abstract string GetEmail(TInput input);
    protected abstract string GetPassword(TInput input);
    protected virtual string GetUserName(TInput input) => GetEmail(input);
    protected virtual bool UsesEmailRegistration => true;
    protected virtual bool SendsConfirmationEmail => UsesEmailRegistration;

    /// <summary>Populate application-specific user fields before it is persisted.</summary>
    protected virtual Task ConfigureUserAsync(TUser user, TInput input, CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>Persist application entities that depend on a successfully created user.</summary>
    protected virtual Task CreateRelatedEntitiesAsync(TUser user, TInput input, CancellationToken cancellationToken) => Task.CompletedTask;
    protected virtual Task OnUserCreatedAsync(TUser user, TInput input, CancellationToken cancellationToken) => Task.CompletedTask;

    protected virtual string? GetPostRegistrationRedirectUrl() => ReturnUrl;

    protected async Task RegisterUserAsync()
    {
        var cancellationToken = CancellationToken.None;
        var user = CreateUser();
        var email = GetEmail(Input);

        await UserStore.SetUserNameAsync(user, GetUserName(Input), cancellationToken);
        if (UsesEmailRegistration)
        {
            var emailStore = GetEmailStore();
            await emailStore.SetEmailAsync(user, email, cancellationToken);
        }
        await ConfigureUserAsync(user, Input, cancellationToken);

        var result = await UserManager.CreateAsync(user, GetPassword(Input));
        if (!result.Succeeded)
        {
            IdentityErrors = result.Errors;
            return;
        }

        await OnUserCreatedAsync(user, Input, cancellationToken);
        await CreateRelatedEntitiesAsync(user, Input, cancellationToken);
        Logger.LogInformation("User created a new account.");

        if (SendsConfirmationEmail)
        {
            var userId = await UserManager.GetUserIdAsync(user);
            var code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(await UserManager.GenerateEmailConfirmationTokenAsync(user)));
            var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri(IdentityRoutes.Account.ConfirmEmail).AbsoluteUri,
                new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code, ["returnUrl"] = ReturnUrl });
            await EmailSender.SendConfirmationLinkAsync(user, email, HtmlEncoder.Default.Encode(callbackUrl));
            if (UserManager.Options.SignIn.RequireConfirmedAccount)
                RedirectManager.RedirectTo(IdentityRoutes.Account.RegisterConfirmation, new Dictionary<string, object?> { ["email"] = email, ["returnUrl"] = ReturnUrl });
        }

        await SignInManager.SignInAsync(user, isPersistent: false);
        RedirectManager.RedirectTo(GetPostRegistrationRedirectUrl());
    }

    private IUserEmailStore<TUser> GetEmailStore()
    {
        if (!UserManager.SupportsUserEmail)
            throw new NotSupportedException("The user store must support email.");

        return (IUserEmailStore<TUser>)UserStore;
    }
}
