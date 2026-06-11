using System.ComponentModel.DataAnnotations;

namespace Suttisak.Blazor.Identity.Region.Identity;

public class UsernamePasswordInputModel
{
    [Required]
    public string Username
    {
        get => field;
        set => field = value.Trim();
    } = "";

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }

}

public class PasskeyOutputModel
{
    public string? CredentialJson { get; set; }
    public string? Error { get; set; }
}