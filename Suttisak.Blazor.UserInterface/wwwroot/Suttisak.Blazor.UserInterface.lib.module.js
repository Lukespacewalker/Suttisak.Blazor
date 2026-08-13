let isThemingSetup = false;
let isThemingScheduled = false;
let themeObserver;
let formControlObserver;

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

function parseLocalDateTime(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value ?? "");
    if (!match) return null;
    const parts = match.slice(1, 6).map(Number);
    const seconds = match[6] ? Number(match[6]) : 0;
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], seconds, 0);
    const roundTrips = date.getFullYear() === parts[0]
        && date.getMonth() === parts[1] - 1
        && date.getDate() === parts[2]
        && date.getHours() === parts[3]
        && date.getMinutes() === parts[4]
        && date.getSeconds() === seconds;
    return roundTrips ? date : null;
}

function hasAmbiguousOffset(date) {
    const sameWallTime = candidate => candidate.getFullYear() === date.getFullYear()
        && candidate.getMonth() === date.getMonth()
        && candidate.getDate() === date.getDate()
        && candidate.getHours() === date.getHours()
        && candidate.getMinutes() === date.getMinutes();
    const before = new Date(date.getTime() - 2 * 60 * 60 * 1000);
    const after = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const offsetDelta = Math.abs(before.getTimezoneOffset() - after.getTimezoneOffset());
    if (offsetDelta === 0) return false;
    return sameWallTime(new Date(date.getTime() - offsetDelta * 60 * 1000))
        || sameWallTime(new Date(date.getTime() + offsetDelta * 60 * 1000));
}

function enhanceDateTimeControl(control) {
    if (control.dataset.browserDateTimeReady === "true") return;
    control.dataset.browserDateTimeReady = "true";

    const localInput = control.querySelector("[data-browser-local-datetime]");
    const utcInput = control.querySelector("[data-browser-utc-datetime]");
    const timeZoneInput = control.querySelector("[data-browser-timezone-id]");
    const offsetInput = control.querySelector("[data-browser-offset-minutes]");
    const timeZoneLabel = control.querySelector("[data-browser-timezone-label]");
    const error = control.querySelector("[data-browser-datetime-error]");
    if (!localInput || !utcInput || !timeZoneInput || !offsetInput) return;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    timeZoneInput.value = timeZone;
    if (timeZoneLabel) timeZoneLabel.textContent = timeZone;

    const synchronize = () => {
        localInput.setCustomValidity("");
        if (error) error.textContent = "";
        utcInput.value = "";
        offsetInput.value = "";
        if (!localInput.value) return;

        const date = parseLocalDateTime(localInput.value);
        if (!date) {
            const message = "This local time does not exist in the browser time zone.";
            localInput.setCustomValidity(message);
            if (error) error.textContent = message;
            return;
        }
        if (hasAmbiguousOffset(date)) {
            const message = "This local time occurs twice when the clock changes. Choose another time.";
            localInput.setCustomValidity(message);
            if (error) error.textContent = message;
            return;
        }

        utcInput.value = date.toISOString();
        offsetInput.value = String(-date.getTimezoneOffset());
    };

    localInput.addEventListener("input", synchronize);
    localInput.addEventListener("change", synchronize);
    synchronize();
}

function setupFormControls() {
    if (!document.documentElement) return;
    document.querySelectorAll("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
    if (formControlObserver) return;
    formControlObserver = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches("[data-browser-datetime-control]")) enhanceDateTimeControl(node);
                node.querySelectorAll?.("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
            }
        }
    });
    formControlObserver.observe(document.documentElement, { childList: true, subtree: true });
}

export function beforeStart() {
    setupTheming();
    setupFormControls();
}

export function afterStarted() {
    setupTheming();
    setupFormControls();
}

export function beforeWebStart() {
    setupTheming();
    setupFormControls();
}

export function afterWebStarted() {
    setupTheming();
    setupFormControls();
}
