let isThemingSetup = false;

const themeSettingsKey = "fluentui-blazor:theme-settings";

function getThemePreference() {
    try {
        const raw = localStorage.getItem(themeSettingsKey);
        if (!raw) return "system";

        const mode = JSON.parse(raw)?.mode;
        return mode === "light" || mode === "dark" ? mode : "system";
    } catch {
        return "system";
    }
}

function applyResolvedTheme(preference = getThemePreference()) {
    if (!document.body) return;

    const resolvedTheme = preference === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preference;

    document.body.dataset.theme = resolvedTheme;
    document.body.dataset.themePreference = preference;
}

function setupTheming() {
    if (isThemingSetup) return;

    if (!document.body) {
        document.addEventListener('DOMContentLoaded', setupTheming);
        return;
    }

    isThemingSetup = true;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme.addEventListener("change", () => {
        if (getThemePreference() === "system") applyResolvedTheme("system");
    });
    window.addEventListener("storage", event => {
        if (event.key === themeSettingsKey) applyResolvedTheme();
    });

    applyResolvedTheme();
}

export function beforeWebStart() {
    setupTheming();
}

export function afterWebStarted() {
    setupTheming();
}

export function setThemePreference(preference) {
    applyResolvedTheme(preference);
}
