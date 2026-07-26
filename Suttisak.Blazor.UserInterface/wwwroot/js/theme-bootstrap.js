(() => {
    const storageKey = "fluentui-blazor:theme-settings";
    let preference = "system";

    try {
        const mode = JSON.parse(localStorage.getItem(storageKey) ?? "{}")?.mode;
        if (mode === "light" || mode === "dark") preference = mode;
    } catch {
        // Invalid or unavailable storage falls back to the operating-system theme.
    }

    const scheme = preference === "dark"
        || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";

    document.documentElement.dataset.colorScheme = scheme;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = scheme;
})();
