using Suttisak.Blazor.Playbook.Components.Specimens;
using Suttisak.Blazor.UserInterface.Components;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Components.Experience;
using Suttisak.Blazor.UserInterface.Components.Marketing;
using Suttisak.Blazor.UserInterface.Components.Navigation;
using Suttisak.Blazor.UserInterface.Components.Pages;
using Suttisak.Blazor.UserInterface.Components.Timezone;

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
            ["AppSelectItem"] = new(typeof(AppSelectItem<string>), typeof(AppSelectSpecimen)),
            ["AppMultiSelect"] = new(typeof(AppMultiSelect<string>), typeof(AdvancedInputsSpecimen)),
            ["AppRadioGroup"] = new(typeof(AppRadioGroup<string>), typeof(AdvancedInputsSpecimen)),
            ["AppRadio"] = new(typeof(AppRadio<string>), typeof(AdvancedInputsSpecimen)),
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
            ["AppTab"] = new(typeof(AppTab), typeof(AppTabsSpecimen)),
            ["AppBreadcrumb"] = new(typeof(AppBreadcrumb), typeof(AppBreadcrumbSpecimen)),
            ["AppDialog"] = new(typeof(AppDialog<string, string>), typeof(AppDialogSpecimen)),
            ["AppDrawer"] = new(typeof(AppDrawer<string, string>), typeof(AppDrawerSpecimen)),
            ["AppDataGrid"] = new(typeof(AppDataGrid), typeof(AppDataGridSpecimen)),
            ["AppGrid"] = new(typeof(AppGrid<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AppGridPaginator"] = new(typeof(AppGridPaginator), typeof(AppDataGridSpecimen)),
            ["AppGridPropertyColumn"] = new(typeof(AppGridPropertyColumn<DemoRecord, string>), typeof(AppDataGridSpecimen)),
            ["AppGridSelectColumn"] = new(typeof(AppGridSelectColumn<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AppGridTemplateColumn"] = new(typeof(AppGridTemplateColumn<DemoRecord>), typeof(AppDataGridSpecimen)),
            ["AppPagination"] = new(typeof(AppPagination), typeof(PaginationDataSpecimen)),
            ["AppQuickGrid"] = new(typeof(AppQuickGrid<DemoRecord>), typeof(PaginationDataSpecimen)),
            ["AppQuickPaginator"] = new(typeof(AppQuickPaginator), typeof(PaginationDataSpecimen)),
            ["DataGridContainer"] = new(typeof(DataGridContainer), typeof(PaginationDataSpecimen)),
            ["AsyncContent"] = new(typeof(AsyncContent), typeof(FeedbackAsyncSpecimen)),
            ["AppLoading"] = new(typeof(AppLoading), typeof(FeedbackAsyncSpecimen)),
            ["AppProgress"] = new(typeof(AppProgress), typeof(FeedbackAsyncSpecimen)),
            ["AppSkeleton"] = new(typeof(AppSkeleton), typeof(FeedbackAsyncSpecimen)),
            ["FeedbackBanner"] = new(typeof(FeedbackBanner), typeof(FeedbackAsyncSpecimen)),
            ["StatusPanel"] = new(typeof(StatusPanel), typeof(FeedbackAsyncSpecimen)),
            ["AppCard"] = new(typeof(AppCard), typeof(LayoutDisplaySpecimen)),
            ["AppStack"] = new(typeof(AppStack), typeof(LayoutDisplaySpecimen)),
            ["AppDivider"] = new(typeof(AppDivider), typeof(LayoutDisplaySpecimen)),
            ["Pill"] = new(typeof(Pill), typeof(LayoutDisplaySpecimen)),
            ["Toolbar"] = new(typeof(Toolbar), typeof(LayoutDisplaySpecimen)),
            ["CardMenu"] = new(typeof(CardMenu), typeof(LayoutDisplaySpecimen)),
            ["LocalTime"] = new(typeof(LocalTime), typeof(TimeLocalizationSpecimen)),
            ["InitializeTimeZone"] = new(typeof(InitializeTimeZone), typeof(TimeLocalizationSpecimen)),
            ["ExperienceCard"] = new(typeof(ExperienceCard), typeof(ExperienceSpecimen)),
            ["ExperienceDisclosure"] = new(typeof(ExperienceDisclosure), typeof(ExperienceSpecimen)),
            ["ExperienceDisclosureGroup"] = new(typeof(ExperienceDisclosureGroup), typeof(ExperienceSpecimen)),
            ["ExperienceHeading"] = new(typeof(ExperienceHeading), typeof(ExperienceSpecimen)),
            ["MarketingActionLink"] = new(typeof(MarketingActionLink), typeof(MarketingSpecimen)),
            ["MarketingCallToAction"] = new(typeof(MarketingCallToAction), typeof(MarketingSpecimen)),
            ["MarketingCard"] = new(typeof(MarketingCard), typeof(MarketingSpecimen)),
            ["MarketingContainer"] = new(typeof(MarketingContainer), typeof(MarketingSpecimen)),
            ["MarketingFeatureGrid"] = new(typeof(MarketingFeatureGrid), typeof(MarketingSpecimen)),
            ["MarketingHero"] = new(typeof(MarketingHero), typeof(MarketingSpecimen)),
            ["MarketingProductFrame"] = new(typeof(MarketingProductFrame), typeof(MarketingSpecimen)),
            ["MarketingProofItem"] = new(typeof(MarketingProofItem), typeof(MarketingSpecimen)),
            ["MarketingProofStrip"] = new(typeof(MarketingProofStrip), typeof(MarketingSpecimen)),
            ["MarketingSectionHeader"] = new(typeof(MarketingSectionHeader), typeof(MarketingSpecimen)),
            ["MarketingStep"] = new(typeof(MarketingStep), typeof(MarketingSpecimen)),
            ["MarketingStepList"] = new(typeof(MarketingStepList), typeof(MarketingSpecimen)),
            ["Nav"] = new(typeof(Nav), typeof(NavigationSpecimen)),
            ["NavGroup"] = new(typeof(NavGroup), typeof(NavigationSpecimen)),
            ["NavItem"] = new(typeof(NavItem), typeof(NavigationSpecimen)),
            ["NavSubmenu"] = new(typeof(NavSubmenu), typeof(NavigationSpecimen)),
            ["PageHeading"] = new(typeof(PageHeading), typeof(PageCompositionSpecimen)),
            ["PageActionToolbar"] = new(typeof(PageActionToolbar), typeof(PageCompositionSpecimen)),
            ["PageBreadcrumbs"] = new(typeof(PageBreadcrumbs), typeof(PageCompositionSpecimen)),
            ["SectionNavigation"] = new(typeof(SectionNavigation), typeof(PageCompositionSpecimen)),
            ["MobileNavigationAccount"] = new(typeof(MobileNavigationAccount), typeof(AccountNavigationSpecimen)),
            ["ProfileMenu"] = new(typeof(ProfileMenu), typeof(AccountNavigationSpecimen))
        };

    public static bool TryGet(string componentName, out PlaybookSpecimenRegistration registration) =>
        Registrations.TryGetValue(componentName, out registration!);

    public static Type? RuntimeTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.RuntimeType : component.RuntimeType;

    public static Type? SpecimenTypeFor(PlaybookComponentDefinition component) =>
        TryGet(component.Name, out var registration) ? registration.SpecimenType : null;

    public static int InteractiveSpecimenCount => Registrations.Count;
}
