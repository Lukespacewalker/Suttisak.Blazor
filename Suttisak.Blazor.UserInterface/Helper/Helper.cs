namespace Suttisak.Blazor.UserInterface.Helper;

public static class Helper
{
    public static string TryGetCustomStringThenFallbackToResource(string? customString, string resourceString)
    {
        return string.IsNullOrEmpty(customString) ? resourceString : customString;
    }
}