using Microsoft.FluentUI.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Components;

namespace Suttisak.Blazor.UserInterface.Components.Common;

public partial class CardMenu : FluentCard
{
    public CardMenu(LibraryConfiguration configuration, NavigationManager navigationManager, string? url, Icon? icon, string? title, string? subtitle) : base(configuration)
    {
        NavigationManager = navigationManager;
        Url = url;
        Icon = icon;
        Title = title;
        Subtitle = subtitle;
    }
}