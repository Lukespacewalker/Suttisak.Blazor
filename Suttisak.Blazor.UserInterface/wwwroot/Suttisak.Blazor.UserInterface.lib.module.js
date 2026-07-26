let isThemingSetup = false;
let isThemingScheduled = false;
let themeObserver;

const themeSettingsKey = "fluentui-blazor:theme-settings";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function getThemePreference() {
    try {
        const mode = JSON.parse(localStorage.getItem(themeSettingsKey) ?? "{}")?.mode;
        return mode === "light" || mode === "dark" ? mode : "system";
    } catch {
        return "system";
    }
}

function resolveColorScheme(preference) {
    return preference === "dark" || (preference === "system" && systemTheme.matches)
        ? "dark"
        : "light";
}

function applyTheme(preference = getThemePreference(), resolvedScheme) {
    preference = String(preference).toLowerCase();
    if (preference !== "light" && preference !== "dark") preference = "system";

    const scheme = resolvedScheme ?? resolveColorScheme(preference);
    document.documentElement.dataset.colorScheme = scheme;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = scheme;

    if (document.body) {
        document.body.dataset.colorScheme = scheme;
        document.body.dataset.theme = scheme;
        document.body.dataset.themePreference = preference;
    }

    return scheme;
}

function observeFluentTheme() {
    const theme = document.querySelector("fluent-design-theme");
    if (!theme || theme.dataset.suttisakThemeObserved === "true") return;

    theme.dataset.suttisakThemeObserved = "true";
    new MutationObserver(() => {
        const mode = theme.getAttribute("mode");
        applyTheme(
            getThemePreference(),
            mode === "light" || mode === "dark" ? mode : undefined);
    }).observe(theme, { attributes: true, attributeFilter: ["mode"] });
}

function setupTheming() {
    if (isThemingSetup) return;

    if (!document.body) {
        if (!isThemingScheduled) {
            isThemingScheduled = true;
            document.addEventListener("DOMContentLoaded", setupTheming, { once: true });
        }
        return;
    }

    isThemingSetup = true;
    applyTheme();

    document.body.addEventListener("themeChanged", event => {
        if (typeof event.detail?.isDark === "boolean") {
            applyTheme(getThemePreference(), event.detail.isDark ? "dark" : "light");
        }
    });

    systemTheme.addEventListener?.("change", () => {
        if (getThemePreference() === "system") applyTheme("system");
    });

    window.addEventListener("storage", event => {
        if (event.key === themeSettingsKey) applyTheme();
    });

    observeFluentTheme();
    themeObserver = new MutationObserver(observeFluentTheme);
    themeObserver.observe(document.documentElement, { childList: true, subtree: true });

    window.suttisakTheme = {
        initialized: true,
        apply: applyTheme,
        getMode: getThemePreference
    };
}

export function beforeStart() {
    setupTheming();
}

export function afterStarted() {
    setupTheming();
}

export function beforeWebStart() {
    setupTheming();
}

export function afterWebStarted() {
    setupTheming();
}
