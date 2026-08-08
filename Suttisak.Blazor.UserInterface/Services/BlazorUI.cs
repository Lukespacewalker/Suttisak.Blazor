namespace Suttisak.Blazor.UserInterface.Services
{
    public class BlazorUIOptions
    {
        public string? LogoAssetPath { get; set; }
        public string? LoginUrl { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string BreadcrumbLabel { get; set; } = "Breadcrumb";
        public string SkipLinkText { get; set; } = "Skip to main content";
    }
}
