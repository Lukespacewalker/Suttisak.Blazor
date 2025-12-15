using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.FluentUI.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Models;

public class Breadcrumb(Icon Icon, string Url, string title)
{
    public Icon Icon { get; } = Icon;
    public string Url { get; } = Url;
    public string Title { get; } = title;
}