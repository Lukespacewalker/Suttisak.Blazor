using Bunit;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class FormGridTests
{
    private static readonly string RepositoryRoot = FindRepositoryRoot();

    [Fact]
    public void Container_wrapper_preserves_the_grid_and_field_layout_contract()
    {
        using var context = new BunitContext();
        var cut = context.Render<FormGrid>(parameters => parameters
            .Add(component => component.Columns, 4)
            .Add(component => component.CssClass, "profile-grid")
            .Add(component => component.AdditionalAttributes, new Dictionary<string, object>
            {
                ["data-layout"] = "profile"
            })
            .Add(component => component.ChildContent, FieldContent(columnSpan: 3)));

        var container = cut.Find(".form-grid-container");
        var grid = cut.Find(".form-grid");
        var field = cut.Find(".form-field");

        Assert.Equal(container, grid.ParentElement);
        Assert.Contains("profile-grid", grid.ClassList);
        Assert.Equal("profile", grid.GetAttribute("data-layout"));
        Assert.Contains("--form-grid-columns: 4", grid.GetAttribute("style"), StringComparison.Ordinal);
        Assert.Contains("--form-field-span: 3", field.GetAttribute("style"), StringComparison.Ordinal);
    }

    [Fact]
    public void Styles_use_the_form_grid_container_with_a_viewport_fallback()
    {
        var gridCss = Read("Suttisak.Blazor.UserInterface", "Components", "Common", "FormGrid.razor.css");
        var fieldCss = Read("Suttisak.Blazor.UserInterface", "Components", "Common", "FormField.razor.css");

        Assert.Contains("container-name: form-grid", gridCss, StringComparison.Ordinal);
        Assert.Contains("container-type: inline-size", gridCss, StringComparison.Ordinal);
        Assert.Contains("@container form-grid (max-width: 700px)", gridCss, StringComparison.Ordinal);
        Assert.Contains("@container form-grid (max-width: 700px)", fieldCss, StringComparison.Ordinal);
        Assert.Contains("@media (max-width: 700px)", gridCss, StringComparison.Ordinal);
        Assert.Contains("@media (max-width: 700px)", fieldCss, StringComparison.Ordinal);
    }

    private static RenderFragment FieldContent(int columnSpan) => builder =>
    {
        builder.OpenComponent<FormField>(0);
        builder.AddAttribute(1, nameof(FormField.ColumnSpan), columnSpan);
        builder.AddAttribute(2, nameof(FormField.ChildContent), (RenderFragment)(fieldBuilder => fieldBuilder.AddContent(0, "Field")));
        builder.CloseComponent();
    };

    private static string Read(params string[] path) => File.ReadAllText(Path.Combine([RepositoryRoot, .. path]));

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Suttisak.Blazor.slnx")))
            directory = directory.Parent;
        return directory?.FullName ?? throw new InvalidOperationException("Repository root not found.");
    }
}
