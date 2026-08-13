# Experience components

Components for general-audience result, report, education, and guidance pages.
They are intentionally more expressive than the compact `PageHeading` used by
CRUD and administration screens.

## `ExperienceHeader`

`ExperienceHeader` owns the responsive reader-facing hero treatment. The
application owns its wording, watermark, result details, and product visual.

```razor
<ExperienceHeader Eyebrow="Assessment result"
                  Title="Your annual check"
                  Emphasis="is ready"
                  Description="A plain-language summary of the latest result."
                  Watermark="RESULT">
    <Details><span>12 August 2026</span></Details>
    <Visual><ResultScore Value="82" /></Visual>
</ExperienceHeader>
```

Use `PageHeading` for task-oriented CRUD/admin pages. Use `ExperienceHeader`
when the page's primary job is helping a person understand results, guidance,
or a narrative report.

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
