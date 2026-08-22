using Suttisak.Blazor.Playbook.Components.Specimens;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.Playbook.ComponentDocs;

public sealed record PlaybookSpecimenRegistration(Type RuntimeType, Type SpecimenType);

public static class PlaybookSpecimenRegistry
{
    private static readonly IReadOnlyDictionary<string, PlaybookSpecimenRegistration> Registrations =
        new Dictionary<string, PlaybookSpecimenRegistration>(StringComparer.OrdinalIgnoreCase)
        {
            ["AppButton"] = new(typeof(AppButton), typeof(AppButtonSpecimen)),
            ["AppTextBox"] = new(typeof(AppTextBox), typeof(AppTextBoxSpecimen)),
            ["AppTextArea"] = new(typeof(AppTextArea), typeof(AppTextAreaSpecimen)),
            ["AppSelect"] = new(typeof(AppSelect<string>), typeof(AppSelectSpecimen)),
            ["AppCheckbox"] = new(typeof(AppCheckbox), typeof(AppCheckboxSpecimen)),
            ["AppSwitch"] = new(typeof(AppSwitch), typeof(AppSwitchSpecimen)),
            ["AppTabs"] = new(typeof(AppTabs), typeof(AppTabsSpecimen)),
            ["AppBreadcrumb"] = new(typeof(AppBreadcrumb), typeof(AppBreadcrumbSpecimen)),
            ["AppDialog"] = new(typeof(AppDialog<string, string>), typeof(AppDialogSpecimen)),
            ["AppDrawer"] = new(typeof(AppDrawer<string, string>), typeof(AppDrawerSpecimen))
        };

    public static bool TryGet(string componentName, out PlaybookSpecimenRegistration registration) =>
        Registrations.TryGetValue(componentName, out registration!);

    public static Type? RuntimeTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.RuntimeType : component.RuntimeType;

    public static Type? SpecimenTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.SpecimenType : null;

    public static int InteractiveSpecimenCount => Registrations.Count;
}
