using Suttisak.Blazor.Identity.Pages.Identity.Manage;

namespace Suttisak.Blazor.Identity;

public static class IdentityRoutes
{
    public static class Account
    {
        public const string Root = "/Account";


        public const string Profile = $"{Root}/Manage";
        public const string Logout = $"{Root}/Logout";
        public const string Login = $"{Root}/Login";

        public static class Manage
        {
            public const string Root = $"{Account.Root}/Manage";
            public const string Email = $"{Root}/Email";
            public const string ChangePassword = $"{Account.Root}/Manage/ChangePassword";
            public const string PersonalData = $"{Root}/PersonalData";
            public const string DeletePersonalData = $"{Root}/DeletePersonalData";

            public const string Passkeys = $"{Root}/Passkeys";
            public const string RenamePasskeyTemplate = $"{Root}/RenamePasskey/{{credentialId}}";
            public static string RenamePasskeyById(string? credentialId) => $"{Root}/RenamePasskey/{credentialId}";

            public const string ExternalLogins = $"{Root}/ExternalLogins";
            public const string SetPassword = $"{Root}/SetPassword";

            public const string TwoFactorAuthentication = $"{Root}/TwoFactorAuthentication";
            public const string ResetAuthenticator = $"{Root}/ResetAuthenticator";
            public const string EnableAuthenticator = $"{Root}/EnableAuthenticator";
            public const string DisableTwoFactorAuthentication = $"{Root}/DisableTwoFactorAuthentication";
            public const string GenerateRecoveryCodes = $"{Root}/GenerateRecoveryCodes";
        }
    }

    public static class Api
    {
        public const string DownloadPersonalData = "Account/Manage/DownloadPersonalData";
    }
}