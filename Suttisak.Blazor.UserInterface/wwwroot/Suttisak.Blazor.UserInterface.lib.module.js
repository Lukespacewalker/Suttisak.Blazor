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

function formatCalendarDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseCalendarDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function enhanceCalendarControl(control) {
    if (control.dataset.appCalendar !== "popup" || control.dataset.calendarReady === "true") return;
    if (!("showPopover" in HTMLElement.prototype)) return;
    const input = control.querySelector('input[type="date"]');
    const trigger = control.querySelector("[data-calendar-trigger]");
    if (!input || !trigger) return;

    control.dataset.calendarReady = "true";
    control.classList.add("is-popup-ready");
    const firstDay = Number(control.dataset.calendarFirstDay ?? 1);
    let visibleMonth = parseCalendarDate(input.value) ?? new Date();
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);

    const popup = document.createElement("div");
    popup.className = "app-calendar-popup";
    // Auto popovers provide native light-dismiss and Escape behavior without a
    // Blazor event handler, so this enhancement also works on static SSR pages.
    popup.setAttribute("popover", "auto");
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "false");
    popup.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Calendar");
    popup.innerHTML = `
        <div class="app-calendar-popup__header">
            <button class="app-calendar-popup__nav" type="button" data-calendar-previous aria-label="Previous month">‹</button>
            <strong class="app-calendar-popup__title" aria-live="polite"></strong>
            <button class="app-calendar-popup__nav" type="button" data-calendar-next aria-label="Next month">›</button>
        </div>
        <div class="app-calendar-popup__weekdays" aria-hidden="true"></div>
        <div class="app-calendar-popup__days"></div>`;
    control.append(popup);

    const title = popup.querySelector(".app-calendar-popup__title");
    const weekdays = popup.querySelector(".app-calendar-popup__weekdays");
    const days = popup.querySelector(".app-calendar-popup__days");
    const todayValue = formatCalendarDate(new Date());
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

    for (let index = 0; index < 7; index++) {
        const weekday = document.createElement("span");
        weekday.textContent = weekdayFormatter.format(new Date(2024, 0, 7 + ((firstDay + index) % 7)));
        weekdays.append(weekday);
    }

    const isAllowed = value => (!input.min || value >= input.min) && (!input.max || value <= input.max);
    const render = () => {
        title.textContent = monthFormatter.format(visibleMonth);
        days.replaceChildren();
        const offset = (visibleMonth.getDay() - firstDay + 7) % 7;
        const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - offset);
        for (let index = 0; index < 42; index++) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            const value = formatCalendarDate(date);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "app-calendar-popup__day";
            button.textContent = String(date.getDate());
            button.dataset.value = value;
            button.tabIndex = value === input.value ? 0 : -1;
            button.setAttribute("aria-label", new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date));
            if (date.getMonth() !== visibleMonth.getMonth()) button.classList.add("is-outside");
            if (value === todayValue) button.classList.add("is-today");
            if (value === input.value) { button.classList.add("is-selected"); button.setAttribute("aria-current", "date"); }
            button.disabled = !isAllowed(value);
            days.append(button);
        }
    };

    const close = () => {
        if (popup.matches(":popover-open")) popup.hidePopover();
        trigger.setAttribute("aria-expanded", "false");
    };
    const position = () => {
        const rect = trigger.getBoundingClientRect();
        const width = Math.min(320, window.innerWidth - 16);
        popup.style.width = `${width}px`;
        const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
        popup.style.left = `${left}px`;
        popup.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - popup.offsetHeight - 8))}px`;
        popup.style.margin = "0";
    };

    trigger.addEventListener("click", () => {
        if (popup.matches(":popover-open")) { close(); return; }
        const selected = parseCalendarDate(input.value);
        if (selected) visibleMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        render();
        popup.showPopover();
        trigger.setAttribute("aria-expanded", "true");
        position();
        (popup.querySelector(".is-selected:not(:disabled)")
            ?? popup.querySelector(".app-calendar-popup__day:not(:disabled)"))?.focus();
    });
    popup.querySelector("[data-calendar-previous]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); render(); });
    popup.querySelector("[data-calendar-next]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); render(); });
    days.addEventListener("click", event => {
        const button = event.target.closest("button[data-value]");
        if (!button || button.disabled) return;
        input.value = button.dataset.value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        trigger.focus();
    });
    days.addEventListener("keydown", event => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        const increments = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        const increment = increments[event.key];
        if (!increment) return;
        event.preventDefault();
        const date = parseCalendarDate(button.dataset.value);
        date.setDate(date.getDate() + increment);
        const value = formatCalendarDate(date);
        let target = days.querySelector(`[data-value="${value}"]:not(:disabled)`);
        if (!target) {
            visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            render();
            target = days.querySelector(`[data-value="${value}"]:not(:disabled)`);
        }
        target?.focus();
    });
    popup.addEventListener("toggle", event => { if (event.newState === "closed") trigger.setAttribute("aria-expanded", "false"); });
    popup.addEventListener("keydown", event => { if (event.key === "Escape") { close(); trigger.focus(); } });
    input.addEventListener("change", render);
    render();
}

function setupFormControls() {
    if (!document.documentElement) return;
    document.querySelectorAll("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
    document.querySelectorAll("[data-app-calendar]").forEach(enhanceCalendarControl);
    if (formControlObserver) return;
    formControlObserver = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches("[data-browser-datetime-control]")) enhanceDateTimeControl(node);
                node.querySelectorAll?.("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
                if (node.matches("[data-app-calendar]")) enhanceCalendarControl(node);
                node.querySelectorAll?.("[data-app-calendar]").forEach(enhanceCalendarControl);
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
