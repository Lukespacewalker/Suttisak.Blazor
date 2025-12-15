using Suttisak.Blazor.UserInterface.Models;

namespace Suttisak.Blazor.UserInterface.Interfaces;

public interface IBreadcrumbLayout
{
    public void PopulateBreadcrumbs(params IEnumerable<Breadcrumb> breadcrumbs);
}