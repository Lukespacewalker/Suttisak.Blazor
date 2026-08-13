using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace Suttisak.Blazor.Identity;

public sealed class IdentityUserAccessor<TUser>(UserManager<TUser> userManager, IdentityRedirectManager redirectManager) where TUser : class
{
    public async Task<TUser> GetRequiredUserAsync(HttpContext context)
    {
        var user = await userManager.GetUserAsync(context.User);

        if (user is null)
        {
            redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user with ID '{userManager.GetUserId(context.User)}'.", context);
        }

        return user!;
    }
}