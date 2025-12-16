using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;
using Microsoft.FluentUI.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Interfaces;
using Suttisak.Blazor.UserInterface.Models;
using System.Reflection;

namespace Suttisak.Blazor.UserInterface.Components.Pages;


public abstract class BreadcrumbPage : ComponentBase
{
    [Inject] public IStringLocalizerFactory Localizer { get; set; } = null!;

    protected virtual Icon? PageIcon { get; set; }
    protected virtual string? PageUrl { get; set; }
    protected virtual string? PageTitle { get; set; }
    [CascadingParameter] public IBreadcrumbLayout? MainLayout { get; set; }


    private readonly List<Breadcrumb> _breadcrumbs = new();

    public BreadcrumbPage AddPage<TPage>() where TPage : BreadcrumbPage
    {
        var pageType = typeof(TPage);
        var pageIcon = (Icon?)pageType.GetProperty("StaticPageIcon", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageUrl = (string?)pageType.GetProperty("StaticPageUrl", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageTitleKey = (string?)pageType.GetProperty("StaticPageTitleKey", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageTitleResource = (string?)pageType.GetProperty("StaticPageTitleResource", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageTitle = (string?)pageType.GetProperty("StaticPageTitle", BindingFlags.Public | BindingFlags.Static)?.GetValue(null) ?? string.Empty;

        var localizedTitle = LocalizedTitle(pageTitleKey, pageType, pageTitle, pageTitleResource);
        _breadcrumbs.Add(new Breadcrumb(pageIcon, pageUrl ?? string.Empty, localizedTitle));

        return this;
    }

    private string LocalizedTitle(string? pageTitleKey, Type pageType, string pageTitle, string? pageTitleResource = null)
    {
        var pageLocalizationBaseName = pageTitleResource ?? pageType.FullName! + ".razor";

        string localizedTitle;
        if (pageTitleKey is not null)
        {
            var localizer = Localizer.Create(pageLocalizationBaseName, pageType.Assembly.GetName().Name!);
            localizedTitle = localizer[pageTitleKey];
        }
        else
        {
            localizedTitle = pageTitle;
        }

        return localizedTitle;
    }

    public BreadcrumbPage AddThisPage<TPage>()
    {
        AddThisPage(typeof(Type));
        return this;
    }

    public BreadcrumbPage AddThisPage(Type pageType)
    {
        var staticPageIcon = (Icon?)pageType.GetProperty("StaticPageIcon", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageUrl = (string?)pageType.GetProperty("StaticPageUrl", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageTitleKey = (string?)pageType.GetProperty("StaticPageTitleKey", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageTitleResource = (string?)pageType.GetProperty("StaticPageTitleResource", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageTitle = (string?)pageType.GetProperty("StaticPageTitle", BindingFlags.Public | BindingFlags.Static)?.GetValue(null) ?? string.Empty;

        var pageIcon = staticPageIcon ?? PageIcon;
        var pageUrl = staticPageUrl ?? string.Empty;
        var pageTitle = PageTitle ?? LocalizedTitle(staticPageTitleKey, pageType, staticPageTitle, pageTitleResource);
        _breadcrumbs.Add(new Breadcrumb(pageIcon, pageUrl, pageTitle));
        return this;
    }

    public void AddThisPageAndPopulate(Type pageType)
    {
        AddThisPage(pageType).PopulateBreadcrumbs();
    }

    public void AddThisPageAndPopulate<TPage>() where TPage : BreadcrumbPage
    {
        AddThisPage(typeof(TPage)).PopulateBreadcrumbs();
    }

    public void PopulateBreadcrumbs()
    {
        MainLayout?.PopulateBreadcrumbs(_breadcrumbs);
    }
}