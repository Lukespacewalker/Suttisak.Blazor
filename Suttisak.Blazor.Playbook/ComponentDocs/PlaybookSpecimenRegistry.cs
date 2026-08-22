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
            ["AppNumberInput"] = new(typeof(AppNumberInput<int>), typeof(AdvancedInputsSpecimen)),
            ["AppSelect"] = new(typeof(AppSelect<string>), typeof(AppSelectSpecimen)),
            ["AppMultiSelect"] = new(typeof(AppMultiSelect<string>), typeof(AdvancedInputsSpecimen)),
            ["AppRadioGroup"] = new(typeof(AppRadioGroup<string>), typeof(AdvancedInputsSpecimen)),
            ["AppCheckbox"] = new(typeof(AppCheckbox), typeof(AppCheckboxSpecimen)),
            ["AppSwitch"] = new(typeof(AppSwitch), typeof(AppSwitchSpecimen)),
            ["AppCalendarPicker"] = new(typeof(AppCalendarPicker), typeof(AdvancedInputsSpecimen)),
            ["AppTimePicker"] = new(typeof(AppTimePicker), typeof(AdvancedInputsSpecimen)),
            ["AppDateTimePicker"] = new(typeof(AppDateTimePicker), typeof(AdvancedInputsSpecimen)),
            ["FormSection"] = new(typeof(FormSection), typeof(FormCompositionSpecimen)),
            ["FormGrid"] = new(typeof(FormGrid), typeof(FormCompositionSpecimen)),
            ["FormField"] = new(typeof(FormField), typeof(FormCompositionSpecimen)),
            ["FormActions"] = new(typeof(FormActions), typeof(FormCompositionSpecimen)),
            ["FormValidationSummary"] = new(typeof(FormValidationSummary), typeof(FormCompositionSpecimen)),
            ["AppTabs"] = new(typeof(AppTabs), typeof(AppTabsSpecimen)),
            ["AppBreadcrumb"] = new(typeof(AppBreadcrumb), typeof(AppBreadcrumbSpecimen)),
            ["AppDialog"] = new(typeof(AppDialog<string, string>), typeof(AppDialogSpecimen)),
            ["AppDrawer"] = new(typeof(AppDrawer<string, string>), typeof(AppDrawerSpecimen)),
            ["AppDataGrid"] = new(typeof(AppDataGrid), typeof(AppDataGridSpecimen)),
            ["AppGrid"] = new(typeof(AppGrid<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AppGridPaginator"] = new(typeof(AppGridPaginator), typeof(AppDataGridSpecimen)),
            ["AppGridPropertyColumn"] = new(typeof(AppGridPropertyColumn<DemoRecord, string>), typeof(AppDataGridSpecimen)),
            ["AppGridSelectColumn"] = new(typeof(AppGridSelectColumn<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AppGridTemplateColumn"] = new(typeof(AppGridTemplateColumn<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AsyncContent"] = new(typeof(AsyncContent), typeof(FeedbackAsyncSpecimen)),
            ["AppLoading"] = new(typeof(AppLoading), typeof(FeedbackAsyncSpecimen)),
            ["AppProgress"] = new(typeof(AppProgress), typeof(FeedbackAsyncSpecimen)),
            ["AppSkeleton"] = new(typeof(AppSkeleton), typeof(FeedbackAsyncSpecimen)),
            ["FeedbackBanner"] = new(typeof(FeedbackBanner), typeof(FeedbackAsyncSpecimen)),
            ["StatusPanel"] = new(typeof(StatusPanel), typeof(FeedbackAsyncSpecimen))
        };

    public static bool TryGet(string componentName, out PlaybookSpecimenRegistration registration) =>
        Registrations.TryGetValue(componentName, out registration!);

    public static Type? RuntimeTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.RuntimeType : component.RuntimeType;

    public static Type? SpecimenTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.SpecimenType : null;

    public static int InteractiveSpecimenCount => Registrations.Count;
}
