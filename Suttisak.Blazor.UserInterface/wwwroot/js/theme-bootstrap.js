(() => {
    const storageKey = "suttisak-blazor:theme-settings";
    let preference = "system";

    try {
        const mode = JSON.parse(localStorage.getItem(storageKey) ?? "{}")?.mode;
        if (mode === "light" || mode === "dark") preference = mode;
    } catch {
        // Storage can be unavailable in private browsing; use the system scheme instead.
    }

    const scheme = preference === "dark"
        || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";

    document.documentElement.setAttribute("data-theme", scheme);

    const synchronizeThemeSelectors = (root = document) => {
        root.querySelectorAll("[data-theme-selector]").forEach(selector => {
            selector.querySelectorAll("[data-theme-preference]").forEach(button => {
                const selected = button.dataset.themePreference === preference;
                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
        });
    };

    const setTheme = (nextPreference) => {
        preference = nextPreference === "light" || nextPreference === "dark" ? nextPreference : "system";
        try {
            localStorage.setItem(storageKey, JSON.stringify({ mode: preference }));
        } catch {
            // Applying the choice still works when persistent storage is unavailable.
        }

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
            const stored = JSON.parse(event.newValue ?? "{}")?.mode;
            preference = stored === "light" || stored === "dark" ? stored : "system";
        } catch {
            preference = "system";
        }
        setTheme(preference);
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
