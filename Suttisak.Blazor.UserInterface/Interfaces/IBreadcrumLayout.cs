using Suttisak.Blazor.UserInterface.Models;

namespace Suttisak.Blazor.UserInterface.Interfaces;

public interface IBreadcrumLayout
{
    public void PopulateBreadcrumbs(IEnumerable<Breadcrumb> breadcrumbs);
}