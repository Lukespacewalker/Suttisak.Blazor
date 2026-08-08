using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;
using Microsoft.FluentUI.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Interfaces;
using Suttisak.Blazor.UserInterface.Models;
using System.Reflection;

namespace Suttisak.Blazor.UserInterface.Components.Pages;

[Obsolete("Use the PageBreadcrumbs component instead.")]
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

        _breadcrumbs.Add(new Breadcrumb(pageIcon, pageUrl ?? string.Empty,
            LocalizedTitle(pageTitleKey, pageType, pageTitle, pageTitleResource)));
        return this;
    }

    private string LocalizedTitle(string? pageTitleKey, Type pageType, string pageTitle, string? pageTitleResource = null)
    {
        if (pageTitleKey is null)
        {
            return pageTitle;
        }

        var baseName = pageTitleResource ?? pageType.FullName! + ".razor";
        return Localizer.Create(baseName, pageType.Assembly.GetName().Name!)[pageTitleKey];
    }

    public BreadcrumbPage AddThisPage<TPage>()
    {
        AddThisPage(typeof(TPage));
        return this;
    }

    public BreadcrumbPage AddThisPage(Type pageType)
    {
        var staticPageIcon = (Icon?)pageType.GetProperty("StaticPageIcon", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageUrl = (string?)pageType.GetProperty("StaticPageUrl", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageTitleKey = (string?)pageType.GetProperty("StaticPageTitleKey", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var pageTitleResource = (string?)pageType.GetProperty("StaticPageTitleResource", BindingFlags.Public | BindingFlags.Static)?.GetValue(null);
        var staticPageTitle = (string?)pageType.GetProperty("StaticPageTitle", BindingFlags.Public | BindingFlags.Static)?.GetValue(null) ?? string.Empty;

        _breadcrumbs.Add(new Breadcrumb(
            staticPageIcon ?? PageIcon,
            staticPageUrl ?? string.Empty,
            PageTitle ?? LocalizedTitle(staticPageTitleKey, pageType, staticPageTitle, pageTitleResource)));
        return this;
    }

    public void AddThisPageAndPopulate(Type pageType) => AddThisPage(pageType).PopulateBreadcrumbs();

    public void AddThisPageAndPopulate<TPage>() where TPage : BreadcrumbPage =>
        AddThisPage(typeof(TPage)).PopulateBreadcrumbs();

    public void PopulateBreadcrumbs() => MainLayout?.PopulateBreadcrumbs(_breadcrumbs);
}
