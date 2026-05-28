namespace Suttisak.Blazor.UserInterface.Components.Navigation;

public sealed class NavComponentState
{
    public bool IsCollapsed { get; private set; }
    public bool IsMobileOpen { get; private set; }

    public event Action? Changed;

    public void ToggleCollapsed()
    {
        IsCollapsed = !IsCollapsed;
        Changed?.Invoke();
    }

    public void ToggleMobileOpen()
    {
        IsMobileOpen = !IsMobileOpen;
        Changed?.Invoke();
    }

    public void CloseMobile()
    {
        if (!IsMobileOpen)
        {
            return;
        }

        IsMobileOpen = false;
        Changed?.Invoke();
    }
}