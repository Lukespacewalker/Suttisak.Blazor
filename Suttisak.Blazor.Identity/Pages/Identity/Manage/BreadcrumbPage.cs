using Microsoft.AspNetCore.Components;
using Microsoft.FluentUI.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Interfaces;
using Suttisak.Blazor.UserInterface.Models;

namespace Suttisak.Blazor.Identity.Pages.Identity.Manage;

public abstract class BreadcrumbPage : ComponentBase
{
    protected abstract Icon PageIcon { get; set; }
    protected abstract string PageUrl { get; set; } 
    protected abstract string PageTitle { get; set; }
    [CascadingParameter] public IBreadcrumLayout? MainLayout { get; set; }

    private readonly List<Breadcrumb> _breadcrumb = new();

    protected internal BreadcrumbPage AddPage<TPage>(TPage page) where TPage : BreadcrumbPage
    {
        _breadcrumb.Add(new Breadcrumb(page.PageIcon, page.PageUrl, page.PageTitle));
        return this;
    }
    protected internal BreadcrumbPage AddCurrentPage()
    {
        _breadcrumb.Add(new Breadcrumb(PageIcon, PageUrl, PageTitle));
        return this;
    }

    protected internal void PopulateBreadcrumbs()
    {
        MainLayout?.PopulateBreadcrumbs(_breadcrumb);
    }
}