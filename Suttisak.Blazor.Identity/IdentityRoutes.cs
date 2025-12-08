namespace Suttisak.Blazor.Identity;

public static class IdentityRoutes
{
    public static class Account
    {
        public const string Root = "/Account";
        public const string Profile = $"{Root}/Manage";
        public const string ChangePassword = $"{Root}/Manage/ChangePassword";

        public static class Manage
        {
            public const string Root = $"{Account.Root}/Manage";
            public const string Email = $"{Root}/Email";
            public const string Passkeys = $"{Root}/Passkeys";
            public const string SetPassword = $"{Root}/SetPassword";
            public const string PersonalData = $"{Root}/PersonalData";
            public const string DeletePersonalData = $"{Root}/DeletePersonalData";
            public const string TwoFactorAuthentication = $"{Root}/TwoFactorAuthentication";
            public const string ExternalLogins = $"{Root}/ExternalLogins";
            public const string ResetAuthenticator = $"{Root}/ResetAuthenticator";
        }
    }

    public static class Api
    {
        public const string DownloadPersonalData = "Account/Manage/DownloadPersonalData";
    }
}