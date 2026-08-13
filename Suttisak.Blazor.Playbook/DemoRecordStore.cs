namespace Suttisak.Blazor.Playbook;

public sealed class DemoRecordStore
{
    private readonly List<DemoRecord> _records =
    [
        new(1048, "Annual hearing surveillance", "Audiometry", "Narin P.", "In review", new DateTime(2026, 8, 12)),
        new(1047, "North terminal ergonomics", "Ergonomics", "Mali S.", "Active", new DateTime(2026, 8, 11)),
        new(1046, "Operations wellness cohort", "Wellness", "Kanda T.", "Draft", new DateTime(2026, 8, 9)),
        new(1045, "Respirator fitness follow-up", "Occupational health", "Preecha R.", "Active", new DateTime(2026, 8, 8)),
        new(1044, "Shift-work recovery study", "Fatigue", "Suda K.", "Complete", new DateTime(2026, 8, 5)),
        new(1043, "Office movement campaign", "Wellness", "Arthit W.", "Complete", new DateTime(2026, 8, 1))
    ];

    public IReadOnlyList<DemoRecord> Records => _records
        .OrderByDescending(record => record.Id)
        .ToArray();

    public DemoRecord? Find(int id) => _records.FirstOrDefault(record => record.Id == id);

    public DemoRecord Save(DemoRecordDraft draft)
    {
        var existing = draft.Id is null ? null : Find(draft.Id.Value);
        if (existing is null)
        {
            var created = new DemoRecord(
                _records.Max(record => record.Id) + 1,
                draft.Name.Trim(),
                draft.Program.Trim(),
                draft.Owner.Trim(),
                draft.Status,
                DateTime.Today);
            _records.Add(created);
            return created;
        }

        existing.Name = draft.Name.Trim();
        existing.Program = draft.Program.Trim();
        existing.Owner = draft.Owner.Trim();
        existing.Status = draft.Status;
        existing.UpdatedOn = DateTime.Today;
        return existing;
    }

    public void Delete(int id) => _records.RemoveAll(record => record.Id == id);
}

public sealed class DemoRecord(
    int id,
    string name,
    string program,
    string owner,
    string status,
    DateTime updatedOn)
{
    public int Id { get; } = id;
    public string Name { get; set; } = name;
    public string Program { get; set; } = program;
    public string Owner { get; set; } = owner;
    public string Status { get; set; } = status;
    public DateTime UpdatedOn { get; set; } = updatedOn;
}

public sealed class DemoRecordDraft
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Program { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
}
