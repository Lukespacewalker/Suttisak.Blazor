using System;
using System.Collections.Generic;
using System.Text;

namespace Suttisak.BlazorUI.Helper;

public static class Helper
{
    public static string TryGetCustomStringThenFallbackToResource(string? customString, string resourceString)
    {
        return string.IsNullOrEmpty(customString) ? resourceString : customString;
    }
}