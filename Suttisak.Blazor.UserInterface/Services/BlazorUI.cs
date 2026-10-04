namespace Suttisak.Blazor.UserInterface.Services
{
    public class BlazorUIOptions
    {
        public string? LogoAssetPath { get; set; }
        public string? LoginUrl { get; set; }
        public string LogoutUrl { get; set; } = "Account/Logout?ReturnUrl=";
        public string? ProfileImageUrl { get; set; }
        public string BreadcrumbLabel { get; set; } = "Breadcrumb";
        public string SkipLinkText { get; set; } = "Skip to main content";
        public string DefaultCulture { get; set; } = "en-US";
        public string CultureSetUrl { get; set; } = "Culture/Set";
        public string ManageAccountUrl { get; set; } = "Account/Manage";
        public bool CompactHeaderPreferences { get; set; }
        public string HeaderThemeLabel { get; set; } = "Color scheme";
        public string HeaderLanguageLabel { get; set; } = "Language";
    }
}
