export function getTheme() {
    const raw = localStorage.getItem("fluentui-blazor:theme-settings");
    if (!raw) return "system";
    try {
        const parsed = JSON.parse(raw);
        const mode = parsed?.mode;
        if (mode === "light") return "light";
        if (mode === "dark") return "dark";
        return "system";
    } catch {
        return "system";
    }
}

export function setThemePreference(preference) {
    if (!document.body) return;

    const resolvedTheme = preference === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preference;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = preference;
    document.body.dataset.theme = resolvedTheme;
    document.body.dataset.themePreference = preference;
}
