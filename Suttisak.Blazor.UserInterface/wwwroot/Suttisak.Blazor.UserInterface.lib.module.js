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

function applyResolvedTheme(isDark) {
    if (!document.body) return;

    const preference = getThemePreference();
    const colorScheme = isDark ? "dark" : "light";

    document.documentElement.dataset.colorScheme = colorScheme;
    document.documentElement.dataset.themePreference = preference;
    document.body.dataset.colorScheme = colorScheme;
    document.body.dataset.themePreference = preference;
}

function setupTheming() {
    if (isThemingSetup) return;

    if (!document.body) {
        document.addEventListener('DOMContentLoaded', setupTheming);
        return;
    }

    isThemingSetup = true;

    document.body.addEventListener("themeChanged", event => {
        if (typeof event.detail?.isDark === "boolean") {
            applyResolvedTheme(event.detail.isDark);
        }
    });

    applyResolvedTheme(document.body.dataset.theme === "dark");
}

export function beforeWebStart() {
    setupTheming();
}

export function afterWebStarted() {
    setupTheming();
}
