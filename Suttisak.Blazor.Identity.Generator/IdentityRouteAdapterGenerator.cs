using System.Collections.Immutable;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Suttisak.Blazor.Identity.Generator;

[Generator]
public sealed class IdentityRouteAdapterGenerator : IIncrementalGenerator
{
    private const string AttributeMetadataName = "Suttisak.Blazor.Identity.Pages.Identity.GenerateIdentityRouteAdaptersAttribute";

    private static readonly ImmutableArray<RoutePage> Pages =
    [
        new("AccessDenied", "Suttisak.Blazor.Identity.Pages.Identity.AccessDenied", "/Account/AccessDenied", false),
        new("ConfirmEmail", "Suttisak.Blazor.Identity.Pages.Identity.ConfirmEmail", "/Account/ConfirmEmail"),
        new("ConfirmEmailChange", "Suttisak.Blazor.Identity.Pages.Identity.ConfirmEmailChange", "/Account/ConfirmEmailChange"),
        new("ExternalLogin", "Suttisak.Blazor.Identity.Pages.Identity.ExternalLogin", "/Account/ExternalLogin"),
        new("ForgotPassword", "Suttisak.Blazor.Identity.Pages.Identity.ForgotPassword", "/Account/ForgotPassword"),
        new("ForgotPasswordConfirmation", "Suttisak.Blazor.Identity.Pages.Identity.ForgotPasswordConfirmation", "/Account/ForgotPasswordConfirmation", false),
        new("InvalidPasswordReset", "Suttisak.Blazor.Identity.Pages.Identity.InvalidPasswordReset", "/Account/InvalidPasswordReset", false),
        new("InvalidUser", "Suttisak.Blazor.Identity.Pages.Identity.InvalidUser", "/Account/InvalidUser", false),
        new("Lockout", "Suttisak.Blazor.Identity.Pages.Identity.Lockout", "/Account/Lockout", false),
        new("Login", "Suttisak.Blazor.Identity.Pages.Identity.Login", "/Account/Login"),
        new("LoginWith2fa", "Suttisak.Blazor.Identity.Pages.Identity.LoginWith2fa", "/Account/LoginWith2fa"),
        new("LoginWithRecoveryCode", "Suttisak.Blazor.Identity.Pages.Identity.LoginWithRecoveryCode", "/Account/LoginWithRecoveryCode"),
        new("RegisterConfirmation", "Suttisak.Blazor.Identity.Pages.Identity.RegisterConfirmation", "/Account/RegisterConfirmation"),
        new("ResendEmailConfirmation", "Suttisak.Blazor.Identity.Pages.Identity.ResendEmailConfirmation", "/Account/ResendEmailConfirmation"),
        new("ResetPassword", "Suttisak.Blazor.Identity.Pages.Identity.ResetPassword", "/Account/ResetPassword"),
        new("ResetPasswordConfirmation", "Suttisak.Blazor.Identity.Pages.Identity.ResetPasswordConfirmation", "/Account/ResetPasswordConfirmation", false),
        new("ChangePassword", "Suttisak.Blazor.Identity.Pages.Identity.Manage.ChangePassword", "/Account/Manage/ChangePassword", isManage: true),
        new("DeletePersonalData", "Suttisak.Blazor.Identity.Pages.Identity.Manage.DeletePersonalData", "/Account/Manage/DeletePersonalData", isManage: true),
        new("Disable2fa", "Suttisak.Blazor.Identity.Pages.Identity.Manage.Disable2fa", "/Account/Manage/DisableTwoFactorAuthentication", isManage: true),
        new("Email", "Suttisak.Blazor.Identity.Pages.Identity.Manage.Email", "/Account/Manage/Email", isManage: true),
        new("EnableAuthenticator", "Suttisak.Blazor.Identity.Pages.Identity.Manage.EnableAuthenticator", "/Account/Manage/EnableAuthenticator", isManage: true),
        new("ExternalLogins", "Suttisak.Blazor.Identity.Pages.Identity.Manage.ExternalLogins", "/Account/Manage/ExternalLogins", isManage: true),
        new("GenerateRecoveryCodes", "Suttisak.Blazor.Identity.Pages.Identity.Manage.GenerateRecoveryCodes", "/Account/Manage/GenerateRecoveryCodes", isManage: true),
        new("Manage", "Suttisak.Blazor.Identity.Pages.Identity.Manage.Manage", "/Account/Manage", false, true),
        new("Passkeys", "Suttisak.Blazor.Identity.Pages.Identity.Manage.Passkeys", "/Account/Manage/Passkeys", isManage: true),
        new("PersonalData", "Suttisak.Blazor.Identity.Pages.Identity.Manage.PersonalData", "/Account/Manage/PersonalData", isManage: true),
        new("Profile", "Suttisak.Blazor.Identity.Pages.Identity.Manage.Profile", "/Account/Manage/Manage", isManage: true),
        new("RenamePasskey", "Suttisak.Blazor.Identity.Pages.Identity.Manage.RenamePasskey", "/Account/Manage/RenamePasskey/{credentialId}", isManage: true),
        new("ResetAuthenticator", "Suttisak.Blazor.Identity.Pages.Identity.Manage.ResetAuthenticator", "/Account/Manage/ResetAuthenticator", isManage: true),
        new("SetPassword", "Suttisak.Blazor.Identity.Pages.Identity.Manage.SetPassword", "/Account/Manage/SetPassword", isManage: true),
        new("TwoFactorAuthentication", "Suttisak.Blazor.Identity.Pages.Identity.Manage.TwoFactorAuthentication", "/Account/Manage/TwoFactorAuthentication", isManage: true)
    ];

    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var requests = context.SyntaxProvider.ForAttributeWithMetadataName(
            AttributeMetadataName,
            static (node, _) => node is AttributeSyntax,
            static (attributeContext, _) => CreateRequest(attributeContext));

        context.RegisterSourceOutput(requests, static (productionContext, request) =>
        {
            if (request is not null)
                productionContext.AddSource("IdentityRouteAdapters.g.cs", GenerateSource(request));
        });
    }

    private static GenerationRequest? CreateRequest(GeneratorAttributeSyntaxContext context)
    {
        var userType = context.Attributes[0].ConstructorArguments[0].Value as ITypeSymbol;
        if (userType is null)
            return null;

        var generatedNamespace = context.Attributes[0].NamedArguments
            .FirstOrDefault(pair => pair.Key == "Namespace").Value.Value as string;
        if (string.IsNullOrWhiteSpace(generatedNamespace))
            generatedNamespace = context.SemanticModel.Compilation.AssemblyName ?? "IdentityRoutes";

        var layoutType = context.Attributes[0].NamedArguments
            .FirstOrDefault(pair => pair.Key == "LayoutType").Value.Value as ITypeSymbol;
        var manageLayoutType = context.Attributes[0].NamedArguments
            .FirstOrDefault(pair => pair.Key == "ManageLayoutType").Value.Value as ITypeSymbol;
        var excludeFromInteractiveRouting = context.Attributes[0].NamedArguments
            .FirstOrDefault(pair => pair.Key == "ExcludeFromInteractiveRouting").Value.Value as bool? ?? true;
        var excludedPages = context.Attributes[0].NamedArguments
            .FirstOrDefault(pair => pair.Key == "ExcludedPages").Value.Values
            .Select(value => value.Value as string)
            .Where(static value => !string.IsNullOrWhiteSpace(value))
            .Select(static value => value!)
            .ToImmutableHashSet(StringComparer.Ordinal);

        return new GenerationRequest(
            userType.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
            generatedNamespace!,
            layoutType?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
            manageLayoutType?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
            excludeFromInteractiveRouting,
            excludedPages);
    }

    private static string GenerateSource(GenerationRequest request)
    {
        var source = new StringBuilder("// <auto-generated/>\n#nullable enable\n");
        source.Append("namespace ").Append(request.Namespace).Append(";\n\n");
        source.Append("/// <summary>Routable adapters for the shared Identity UI.</summary>\n");
        source.Append("public static class IdentityRouteAdapters { }\n\n");

        foreach (var page in Pages)
        {
            if (request.ExcludedPages.Contains(page.Name))
                continue;

            var layoutType = page.IsManage && request.ManageLayoutType is not null
                ? request.ManageLayoutType
                : request.LayoutType;
            if (layoutType is not null)
                source.Append("[global::Microsoft.AspNetCore.Components.LayoutAttribute(typeof(")
                    .Append(layoutType)
                    .Append("))]\n");
            if (page.IsManage)
                source.Append("[global::Microsoft.AspNetCore.Authorization.AuthorizeAttribute]\n");
            if (request.ExcludeFromInteractiveRouting)
                source.Append("[global::Microsoft.AspNetCore.Components.ExcludeFromInteractiveRoutingAttribute]\n");
            source.Append("[global::Microsoft.AspNetCore.Components.RouteAttribute(\"")
                .Append(page.Route)
                .Append("\")]\n");
            source.Append("public sealed class ").Append(page.Name).Append("IdentityRoute : global::Suttisak.Blazor.Identity.Pages.Identity.IdentityRouteAdapter<")
                .Append(request.UserType)
                .Append(">\n{\n    protected override global::System.Type ScreenType => typeof(global::")
                .Append(page.ComponentType);
            if (page.IsGeneric)
                source.Append('<').Append(request.UserType).Append('>');
            source.Append(");\n}\n\n");
        }

        return source.ToString();
    }

    private sealed class GenerationRequest(
        string userType,
        string @namespace,
        string? layoutType,
        string? manageLayoutType,
        bool excludeFromInteractiveRouting,
        ImmutableHashSet<string> excludedPages)
    {
        public string UserType { get; } = userType;
        public string Namespace { get; } = @namespace;
        public string? LayoutType { get; } = layoutType;
        public string? ManageLayoutType { get; } = manageLayoutType;
        public bool ExcludeFromInteractiveRouting { get; } = excludeFromInteractiveRouting;
        public ImmutableHashSet<string> ExcludedPages { get; } = excludedPages;
    }

    private sealed class RoutePage(string name, string componentType, string route, bool isGeneric = true, bool isManage = false)
    {
        public string Name { get; } = name;
        public string ComponentType { get; } = componentType;
        public string Route { get; } = route;
        public bool IsGeneric { get; } = isGeneric;
        public bool IsManage { get; } = isManage;
    }
}
