namespace Suttisak.Blazor.Identity;
public static class IdentityRoutes
{
    public static class Account
    {
        public const string Root = "/Account";
        public const string Profile = $"{Root}/Manage";
        public const string Email = $"{Root}/Manage/Email";
        public const string Passkeys = $"{Root}/Manage/Passkeys";
        public const string SetPassword = $"{Root}/Manage/SetPassword";
        public const string ChangePassword = $"{Root}/Manage/ChangePassword";
        public const string PersonalData = $"{Root}/Manage/PersonalData";
    }
}