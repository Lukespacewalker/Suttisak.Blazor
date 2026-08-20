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
})();
