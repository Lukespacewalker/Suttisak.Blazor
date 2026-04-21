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
