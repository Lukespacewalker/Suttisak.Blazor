using System.ComponentModel.DataAnnotations;

namespace Suttisak.Blazor.Identity.Region.Identity;

public class InputModel
{
    [Required]
    public string Username { get; set; } = "";

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }

    public PasskeyInputModel? Passkey { get; set; }
}

public class PasskeyInputModel
{
    public string? CredentialJson { get; set; }
    public string? Error { get; set; }
}