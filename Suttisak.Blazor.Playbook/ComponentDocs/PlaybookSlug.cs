namespace Suttisak.Blazor.Playbook.ComponentDocs;

public static class PlaybookSlug
{
    public static string FromText(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        var builder = new System.Text.StringBuilder(value.Length);
        var separatorPending = false;

        foreach (var character in value)
        {
            if (char.IsLetterOrDigit(character))
            {
                if (separatorPending && builder.Length > 0)
                {
                    builder.Append('-');
                }

                builder.Append(char.ToLowerInvariant(character));
                separatorPending = false;
            }
            else
            {
                separatorPending = builder.Length > 0;
            }
        }

        return builder.ToString();
    }
}
