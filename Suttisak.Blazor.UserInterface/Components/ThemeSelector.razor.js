export function getTheme() {
    const raw = localStorage.getItem("suttisak-blazor:theme-settings")
        ?? localStorage.getItem("fluentui-blazor:theme-settings");
    if (!raw) return "system";

    try {
        const mode = JSON.parse(raw)?.mode;
        return mode === "light" || mode === "dark" ? mode : "system";
    } catch {
        return "system";
    }
}

let mediaQuery;

function resolveColorScheme(mode) {
    return mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
}

function applyColorScheme(mode) {
    const scheme = resolveColorScheme(mode);
    document.documentElement.dataset.colorScheme = scheme;
    document.documentElement.style.colorScheme = scheme;
    document.body?.setAttribute("data-color-scheme", scheme);
    document.body?.setAttribute("data-theme", scheme);
}

export function initializeColorScheme() {
    const update = () => applyColorScheme(getTheme());
    mediaQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.onchange = update;
    window.addEventListener("storage", event => {
        if (event.key === "suttisak-blazor:theme-settings" || event.key === "fluentui-blazor:theme-settings") update();
    });
    update();
}

export function setColorScheme(mode) {
    const normalized = String(mode).toLowerCase();
    localStorage.setItem("suttisak-blazor:theme-settings", JSON.stringify({ mode: normalized }));
    applyColorScheme(normalized);
}
