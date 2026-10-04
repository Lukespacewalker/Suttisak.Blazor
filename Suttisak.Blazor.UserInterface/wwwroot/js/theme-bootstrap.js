(() => {
    const storageKey = "suttisak-blazor:theme-settings";
    const appearances = ["standard", "essential", "quiet-luxury", "nexora"];
    const defaultAppearance = appearances.includes(document.documentElement.dataset.defaultAppearance)
        ? document.documentElement.dataset.defaultAppearance : "nexora";
    const modes = ["light", "dark", "system"];
    const defaultTheme = modes.includes(document.documentElement.dataset.defaultTheme)
        ? document.documentElement.dataset.defaultTheme : "system";
    let preference = defaultTheme;
    let appearance = defaultAppearance;

    try {
        const settings = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        const mode = settings?.mode;
        if (modes.includes(mode)) preference = mode;
        if (appearances.includes(settings?.appearance)) appearance = settings.appearance;
    } catch {
        // Storage can be unavailable in private browsing; use the host default.
    }
    let savedAppearance = appearance;

    const scheme = preference === "dark"
        || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";

    document.documentElement.setAttribute("data-theme", scheme);
    document.documentElement.setAttribute("data-appearance", appearance);

    const saveSettings = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ mode: preference, appearance: savedAppearance }));
        } catch {
            // Preferences still work in memory when browser storage is unavailable.
        }
    };

    const synchronizeThemeSelectors = (root = document) => {
        if (document.documentElement.dataset.appearance !== appearance)
            document.documentElement.dataset.appearance = appearance;
        root.querySelectorAll("[data-theme-selector]").forEach(selector => {
            selector.querySelectorAll("[data-theme-preference]").forEach(button => {
                const selected = button.dataset.themePreference === preference;
                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
        });
        root.querySelectorAll("[data-appearance-selector]").forEach(selector => {
            if (selector.value !== appearance) selector.value = appearance;
        });
    };

    const setAppearance = (value, persist = true) => {
        if (!appearances.includes(value)) return;
        appearance = value;
        document.documentElement.setAttribute("data-appearance", appearance);
        if (persist) {
            savedAppearance = appearance;
            saveSettings();
        }
        synchronizeThemeSelectors();
        document.dispatchEvent(new CustomEvent("suttisak-appearance-change", { detail: appearance }));
    };

    window.suttisakAppearance = { get: () => appearance, set: setAppearance };
    document.addEventListener("change", event => {
        if (event.target instanceof HTMLSelectElement && event.target.matches("[data-appearance-selector]")) {
            setAppearance(event.target.value);
        }
    });

    const setTheme = (nextPreference) => {
        preference = nextPreference === "light" || nextPreference === "dark" ? nextPreference : "system";
        saveSettings();

        const nextScheme = preference === "dark"
            || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";
        document.documentElement.setAttribute("data-theme", nextScheme);
        synchronizeThemeSelectors();
    };

    const closeMobileNavigation = (shell) => {
        const navigation = shell.querySelector(".app-shell__navigation");
        const scrim = shell.querySelector(".app-shell__scrim");
        const trigger = shell.querySelector('[data-shell-action="mobile"]');
        navigation?.classList.remove("is-open");
        scrim?.classList.remove("is-visible");
        trigger?.classList.remove("is-open");
        trigger?.setAttribute("aria-expanded", "false");
        if (trigger?.dataset.labelClosed) trigger.setAttribute("aria-label", trigger.dataset.labelClosed);
    };

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        const target = event.target instanceof Element ? event.target : null;
        // A nested native overlay owns the first Escape. Only a visible mobile
        // drawer containing keyboard focus can be dismissed by the shell.
        if (target?.closest("[popover]:popover-open, dialog[open]")) return;
        const navigation = target?.closest(".app-shell__navigation.is-open");
        const shell = navigation?.closest("[data-app-shell]");
        const trigger = shell?.querySelector('[data-shell-action="mobile"]');
        if (!shell || !trigger || trigger.getClientRects().length === 0) return;
        // Native popovers without autofocus keep focus on their invoker. Let
        // the current navigation's open popup consume Escape in that state too.
        if (navigation.querySelector("[popover]:popover-open, dialog[open]")) return;
        event.preventDefault();
        closeMobileNavigation(shell);
        trigger.focus();
    });

    document.addEventListener("click", event => {
        const target = event.target instanceof Element ? event.target : null;
        const themeButton = target?.closest("[data-theme-preference]");
        if (themeButton) {
            setTheme(themeButton.dataset.themePreference);
            return;
        }

        const shell = target?.closest("[data-app-shell]");
        if (!shell) return;

        const action = target.closest("[data-shell-action]")?.dataset.shellAction;
        if (action === "desktop") {
            const frame = shell.querySelector(".app-shell__frame");
            const trigger = target.closest("button");
            const collapsed = frame?.classList.toggle("is-desktop-collapsed") ?? false;
            trigger?.classList.toggle("is-open", !collapsed);
            trigger?.setAttribute("aria-expanded", String(!collapsed));
            const label = collapsed ? trigger?.dataset.labelClosed : trigger?.dataset.labelOpen;
            if (label) trigger?.setAttribute("aria-label", label);
            return;
        }

        if (action === "mobile") {
            const navigation = shell.querySelector(".app-shell__navigation");
            const scrim = shell.querySelector(".app-shell__scrim");
            const trigger = target.closest("button");
            const opened = navigation?.classList.toggle("is-open") ?? false;
            scrim?.classList.toggle("is-visible", opened);
            trigger?.classList.toggle("is-open", opened);
            trigger?.setAttribute("aria-expanded", String(opened));
            const label = opened ? trigger?.dataset.labelOpen : trigger?.dataset.labelClosed;
            if (label) trigger?.setAttribute("aria-label", label);
            return;
        }

        if (action === "close" || target.closest(".app-shell__navigation a")) {
            closeMobileNavigation(shell);
        }
    });

    addEventListener("popstate", () => {
        document.querySelectorAll("[data-app-shell]").forEach(closeMobileNavigation);
    });

    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
        if (preference === "system") setTheme("system");
    });
    addEventListener("storage", event => {
        if (event.key !== storageKey) return;
        try {
            const settings = JSON.parse(event.newValue ?? "{}");
            preference = modes.includes(settings?.mode) ? settings.mode : defaultTheme;
            appearance = appearances.includes(settings?.appearance) ? settings.appearance : defaultAppearance;
        } catch {
            preference = defaultTheme;
            appearance = defaultAppearance;
        }
        savedAppearance = appearance;
        // Do not write storage in response to a storage event: other tabs must
        // observe the same change without an event feedback loop.
        document.documentElement.setAttribute("data-theme", preference === "dark"
            || preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setAppearance(appearance, false);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => synchronizeThemeSelectors(), { once: true });
    } else {
        synchronizeThemeSelectors();
    }

    new MutationObserver(mutations => {
        if (mutations.some(mutation => mutation.type === "childList")) synchronizeThemeSelectors();
    }).observe(document.documentElement, { subtree: true, childList: true });
})();
