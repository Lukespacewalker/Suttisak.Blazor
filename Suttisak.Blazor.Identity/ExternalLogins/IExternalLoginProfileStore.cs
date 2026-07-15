namespace Suttisak.Blazor.Identity;

/// <summary>
/// Optional persistence abstraction for readable external-account names and email addresses.
/// Applications can register an implementation that uses their own database schema.
/// </summary>
public interface IExternalLoginProfileStore<TUser> where TUser : class
{
    Task<IReadOnlyCollection<ExternalLoginProfileInfo>> GetAsync(TUser user, CancellationToken cancellationToken = default);
    Task SaveAsync(TUser user, ExternalLoginProfileInfo profile, CancellationToken cancellationToken = default);
    Task RemoveAsync(TUser user, string loginProvider, string providerKey, CancellationToken cancellationToken = default);
}

internal sealed class NullExternalLoginProfileStore<TUser> : IExternalLoginProfileStore<TUser> where TUser : class
{
    public Task<IReadOnlyCollection<ExternalLoginProfileInfo>> GetAsync(TUser user, CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyCollection<ExternalLoginProfileInfo>>([]);

    public Task SaveAsync(TUser user, ExternalLoginProfileInfo profile, CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task RemoveAsync(TUser user, string loginProvider, string providerKey, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
