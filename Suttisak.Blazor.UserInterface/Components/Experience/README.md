# Experience components

Components for general-audience result, report, education, and guidance pages.
They are intentionally more expressive than the compact `PageHeading` used by
CRUD and administration screens.

## `ExperienceHeading`

`ExperienceHeading` owns the responsive reader-facing heading treatment. The
application owns its wording, watermark, result details, and product visual.

```razor
<ExperienceHeading Eyebrow="Assessment result"
                  Title="Your annual check"
                  Emphasis="is ready"
                  Description="A plain-language summary of the latest result."
                  Watermark="RESULT"
                  VisualIsDecorative="false">
    <Details><span>12 August 2026</span></Details>
    <Visual><ResultScore Value="82" /></Visual>
</ExperienceHeading>
```

Keep `VisualIsDecorative="true"` for atmospheric artwork that may sit behind
the copy on narrow screens. Set it to `false` for meaningful scores, charts, or
status visuals; the mobile layout then reserves a separate visual row so the
content cannot overlap details or body copy.

Use `PageHeading` for task-oriented CRUD/admin pages. Use `ExperienceHeading`
when the page's primary job is helping a person understand results, guidance,
or a narrative report.

In Nexora (UI 1.0.31), both headings use restrained host-provided typography.
PageHeading is an unframed title on the page background, with compact body
spacing and the existing wrapped action/navigation behavior. Other surfaces
and appearance treatments are independent of that task-heading decision.
ExperienceHeading also sits directly on the page background. Both titles use
a larger desktop hierarchy and compact type at narrow container widths.
ExperienceHeading is content-driven: there is no hero minimum height, its title
uses the copy width, and omitted Visual fragments reserve no visual column.
Supplied visuals wrap below the copy when the parent is narrow, including a
320px parent on a desktop page. Meaningful visuals retain their content and
accessibility treatment. Eyebrow and emphasis use the host accent; descriptions
and details use semantic muted text. Other appearances retain their existing
geometry and artwork. No public parameters or application content change.

## `ExperienceCard`

`ExperienceCard` is the bordered content surface for results and guidance. It
uses the consumer's application color tokens and supports flush, elevated, and
interactive treatments without owning product copy.

```razor
<ExperienceCard Elevated="true">
    <h2>Result summary</h2>
    <p>The application continues to own this content.</p>
</ExperienceCard>
```

## `ExperienceDisclosureGroup` and `ExperienceDisclosure`

Use the disclosure components for progressive guidance. They render native
`details` and `summary` elements, retain keyboard behavior without JavaScript,
and can call out an application-defined recommendation.

```razor
<ExperienceDisclosureGroup>
    <ExperienceDisclosure Heading="Level 1"
                          Expanded="true"
                          Recommended="true"
                          BadgeText="Recommended">
        <p>Training instructions supplied by the application.</p>
    </ExperienceDisclosure>
</ExperienceDisclosureGroup>
```
