using System.Text.Json;
using Microsoft.AspNetCore.Components;
using Suttisak.Blazor.Playbook.ComponentDocs;
using Suttisak.Blazor.UserInterface.Components.Common;

namespace Suttisak.Blazor.UserInterface.Tests;

public sealed class PlaybookCatalogContractTests
{
    [Fact]
    public void Public_component_surface_catalog_and_manifest_have_identical_names()
    {
        var exportedNames = typeof(AppButton).Assembly.ExportedTypes
            .Where(type => !type.IsAbstract && typeof(IComponent).IsAssignableFrom(type))
            .Select(ComponentName)
            .Order(StringComparer.Ordinal)
            .ToArray();
        var catalogNames = PlaybookComponentCatalog.All
            .Select(component => component.Name)
            .Order(StringComparer.Ordinal)
            .ToArray();
        var manifest = ReadManifest();
        var manifestNames = manifest.Components
            .Select(component => component.Name)
            .Order(StringComparer.Ordinal)
            .ToArray();

        Assert.Equal(exportedNames, catalogNames);
        Assert.Equal(exportedNames, manifestNames);
        Assert.Equal(manifest.Components.Count, manifest.ComponentCount);
    }

    [Fact]
    public void Catalog_and_manifest_metadata_are_unique_complete_and_equal()
    {
        var catalog = PlaybookComponentCatalog.All;
        var manifest = ReadManifest();

        Assert.Equal(catalog.Count, catalog.Select(component => component.Name).Distinct(StringComparer.OrdinalIgnoreCase).Count());
        Assert.Equal(catalog.Count, catalog.Select(component => component.Slug).Distinct(StringComparer.OrdinalIgnoreCase).Count());
        Assert.Equal(catalog.Count, catalog.Select(component => component.Summary).Distinct(StringComparer.Ordinal).Count());

        var manifestByName = manifest.Components.ToDictionary(component => component.Name, StringComparer.Ordinal);
        foreach (var component in catalog)
        {
            Assert.False(string.IsNullOrWhiteSpace(component.Slug));
            Assert.False(string.IsNullOrWhiteSpace(component.Category));
            Assert.False(string.IsNullOrWhiteSpace(component.Summary));
            Assert.False(string.IsNullOrWhiteSpace(component.SourceArea));
            Assert.NotEmpty(component.Tags);

            var entry = manifestByName[component.Name];
            Assert.Equal(component.Slug, entry.Slug);
            Assert.Equal(component.Category, entry.Category);
            Assert.Equal(component.Status.ToString().ToLowerInvariant(), entry.Status);
            Assert.Equal(component.Coverage.ToString().ToLowerInvariant(), entry.Coverage);
            Assert.Equal(component.Summary, entry.Summary);
            Assert.Equal(component.Tags, entry.Tags);
            Assert.Equal(component.SourceArea, entry.SourceArea);
            Assert.Equal(component.RelatedPatternIds, entry.RelatedPatternIds);
        }

        var groupedManifestNames = manifest.Groups
            .SelectMany(group => group.Components)
            .Order(StringComparer.Ordinal)
            .ToArray();
        Assert.Equal(manifestByName.Keys.Order(StringComparer.Ordinal).ToArray(), groupedManifestNames);
    }

    [Fact]
    public void Interactive_coverage_and_specimen_registrations_are_consistent()
    {
        foreach (var component in PlaybookComponentCatalog.All)
        {
            var hasRegistration = PlaybookSpecimenRegistry.TryGet(component.Name, out var registration);
            Assert.Equal(component.Coverage == PlaybookComponentCoverageKind.Interactive, hasRegistration);

            var runtimeType = PlaybookSpecimenRegistry.RuntimeTypeFor(component);
            Assert.NotNull(runtimeType);
            Assert.False(runtimeType.IsAbstract);
            Assert.True(typeof(IComponent).IsAssignableFrom(runtimeType), $"{runtimeType} is not an IComponent.");
            Assert.Equal(component.Name, ComponentName(runtimeType));

            if (registration is not null)
            {
                Assert.False(registration.SpecimenType.IsAbstract);
                Assert.True(typeof(IComponent).IsAssignableFrom(registration.SpecimenType), $"{registration.SpecimenType} is not an IComponent.");
            }
        }

        foreach (var componentName in PlaybookSpecimenRegistry.All.Keys)
        {
            Assert.Contains(PlaybookComponentCatalog.All, component =>
                component.Name.Equals(componentName, StringComparison.OrdinalIgnoreCase));
        }

        Assert.Equal(PlaybookSpecimenRegistry.All.Count, PlaybookSpecimenRegistry.InteractiveSpecimenCount);
        Assert.Equal(
            PlaybookSpecimenRegistry.All.Values.Select(registration => registration.SpecimenType).Distinct().Count(),
            PlaybookSpecimenRegistry.DistinctSpecimenCount);
    }

    [Fact]
    public void Pattern_coverage_resolves_to_real_routes_and_noninteractive_entries_have_documentation()
    {
        var playbookAssembly = typeof(PlaybookComponentCatalog).Assembly;
        var routes = playbookAssembly.GetTypes()
            .SelectMany(type => type.GetCustomAttributes(typeof(RouteAttribute), inherit: false).Cast<RouteAttribute>())
            .Select(attribute => NormalizeRoute(attribute.Template))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var component in PlaybookComponentCatalog.All.Where(component => component.Coverage != PlaybookComponentCoverageKind.Interactive))
        {
            Assert.NotNull(PlaybookComponentCoverage.DocumentationFor(component));
        }

        foreach (var component in PlaybookComponentCatalog.All.Where(component => component.Coverage == PlaybookComponentCoverageKind.Pattern))
        {
            var route = component.ExistingHref.Split('#', 2)[0];
            Assert.False(string.IsNullOrWhiteSpace(route));
            Assert.Contains(NormalizeRoute(route), routes);
            Assert.NotEmpty(component.RelatedPatternIds);
        }
    }

    [Fact]
    public void Pattern_catalog_manifest_routes_and_component_backlinks_are_consistent()
    {
        var manifest = ReadManifest();
        var manifestPatterns = manifest.Patterns.ToDictionary(pattern => pattern.Slug, StringComparer.Ordinal);
        var routes = typeof(PlaybookComponentCatalog).Assembly.GetTypes()
            .SelectMany(type => type.GetCustomAttributes(typeof(RouteAttribute), inherit: false).Cast<RouteAttribute>())
            .Select(attribute => NormalizeRoute(attribute.Template))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.Equal(PlaybookPatternCatalog.All.Count, manifestPatterns.Count);
        Assert.Equal(
            PlaybookPatternCatalog.All.Count,
            PlaybookPatternCatalog.All.Select(pattern => pattern.Slug).Distinct(StringComparer.OrdinalIgnoreCase).Count());

        foreach (var pattern in PlaybookPatternCatalog.All)
        {
            Assert.NotEmpty(pattern.Ingredients);
            Assert.NotEmpty(pattern.CompositionSteps);
            Assert.NotEmpty(pattern.MinimalRazorRecipe);
            Assert.NotEmpty(pattern.QualityChecks);
            Assert.Contains(NormalizeRoute(pattern.LiveHref), routes);

            var manifestPattern = manifestPatterns[pattern.Slug];
            Assert.Equal(pattern.Name, manifestPattern.Name);
            Assert.Equal(pattern.Category, manifestPattern.Category);
            Assert.Equal(pattern.Maturity.ToString().ToLowerInvariant(), manifestPattern.Maturity);
            Assert.Equal(pattern.Summary, manifestPattern.Summary);
            Assert.Equal(pattern.LiveHref, manifestPattern.LiveHref);
            Assert.Equal(
                pattern.Ingredients.Select(ingredient => ingredient.ComponentName),
                manifestPattern.Ingredients.Select(ingredient => ingredient.ComponentName));

            foreach (var ingredient in pattern.Ingredients)
            {
                var component = Assert.Single(PlaybookComponentCatalog.All, component =>
                    component.Name.Equals(ingredient.ComponentName, StringComparison.Ordinal));
                Assert.Contains(pattern.Slug, component.RelatedPatternIds);
            }
        }
    }

    private static PlaybookComponentManifest ReadManifest()
    {
        var manifestPath = Path.Combine(AppContext.BaseDirectory, "PlaybookFixtures", "component-manifest.json");
        var manifest = JsonSerializer.Deserialize<PlaybookComponentManifest>(
            File.ReadAllText(manifestPath),
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        return Assert.IsType<PlaybookComponentManifest>(manifest);
    }

    private static string ComponentName(Type type) => type.Name.Split('`', 2)[0];

    private static string NormalizeRoute(string route) => route.Trim().TrimStart('/').TrimEnd('/');

    private sealed record PlaybookComponentManifest(
        int SchemaVersion,
        int ComponentCount,
        IReadOnlyList<PlaybookComponentManifestEntry> Components,
        IReadOnlyList<PlaybookComponentManifestGroup> Groups,
        IReadOnlyList<PlaybookPatternManifestEntry> Patterns);

    private sealed record PlaybookComponentManifestEntry(
        string Name,
        string Slug,
        string Category,
        string Status,
        string Coverage,
        string Summary,
        IReadOnlyList<string> Tags,
        string SourceArea,
        IReadOnlyList<string> RelatedPatternIds);

    private sealed record PlaybookComponentManifestGroup(
        string Category,
        string Status,
        IReadOnlyList<string> Components);

    private sealed record PlaybookPatternManifestEntry(
        string Name,
        string Slug,
        string Category,
        string Maturity,
        string Summary,
        string LiveHref,
        IReadOnlyList<PlaybookPatternManifestIngredient> Ingredients);

    private sealed record PlaybookPatternManifestIngredient(
        string ComponentId,
        string ComponentName,
        string Role);
}
