using System.Text;
using Microsoft.JSInterop;

namespace Suttisak.Blazor.Playbook;

// File contents and data selection are application concerns. The shared grid
// supplies selection and callbacks; this Playbook consumer owns its CSV format.
internal static class DemoCsv
{
    public static Task ExportRecordsAsync(IJSRuntime js, IEnumerable<DemoRecord> records)
        => DownloadAsync(js, "selected-records.csv",
            new[] { new[] { "ID", "Name", "Program", "Owner", "Status" } }
                .Concat(records.OrderBy(record => record.Id).Select(record => new[]
                { record.Id.ToString(), record.Name, record.Program, record.Owner, record.Status })));

    public static async Task DownloadAsync(IJSRuntime js, string filename, IEnumerable<string[]> rows)
    {
        var csv = string.Join("\r\n", rows.Select(row => string.Join(',', row.Select(Escape))));
        using var stream = new MemoryStream(Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv)).ToArray());
        using var reference = new DotNetStreamReference(stream);
        await js.InvokeVoidAsync("downloadFileFromStream", filename, reference);
    }

    private static string Escape(string value)
    {
        if (value.TrimStart().StartsWith('=') || value.TrimStart().StartsWith('+')
            || value.TrimStart().StartsWith('-') || value.TrimStart().StartsWith('@')) value = "'" + value;
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }
}
