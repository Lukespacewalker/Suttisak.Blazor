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

// Compact shell navigation uses native top-layer popovers so scrolling the rail
// never clips labels or submenu destinations. Native disclosures remain inline
// on expanded shells and mobile drawers, including before Blazor starts.
(() => {
    let flyout;
    let tooltip;
    let hideTimer;
    const railStates = new WeakMap();
    const expandedStates = new WeakMap();
    const observedShells = new Set();
    const shellObserver = new ResizeObserver(entries => {
        for (const { target: shell } of entries) {
            if (!isRail(shell)) {
                if (tooltip?.trigger.closest('[data-app-shell]') === shell) hideTooltip();
                if (flyout?.trigger.closest('[data-app-shell]') === shell) closeFlyout();
            } else {
                if (flyout?.trigger.closest('[data-app-shell]') === shell) positionPanel(flyout.panel, flyout.trigger);
                if (tooltip?.trigger.closest('[data-app-shell]') === shell) positionPanel(tooltip.panel, tooltip.trigger);
            }
            synchronizeRail(shell);
        }
    });
    const isRail = shell => shell?.querySelector('.app-shell__frame')?.classList.contains('is-desktop-collapsed')
        && shell.querySelector('[data-shell-action="desktop"]')?.getClientRects().length > 0;

    const hideTooltip = () => {
        clearTimeout(hideTimer);
        if (tooltip?.panel.matches(':popover-open')) tooltip.panel.hidePopover();
        tooltip = null;
    };

    const closeFlyout = (restoreFocus = false) => {
        if (!flyout) return;
        const { panel, trigger, details } = flyout;
        flyout = null;
        panel.removeEventListener('toggle', onFlyoutToggle);
        if (panel.matches(':popover-open')) panel.hidePopover();
        panel.removeAttribute('popover');
        panel.style.removeProperty('left');
        panel.style.removeProperty('top');
        if (details) details.open = false;
        else trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus && trigger.isConnected) trigger.focus();
    };
    const onFlyoutToggle = event => {
        if (event.newState === 'closed' && flyout?.panel === event.target) closeFlyout();
    };

    const synchronizeRail = shell => {
        const compact = Boolean(isRail(shell));
        if (railStates.get(shell) === compact) return;
        railStates.set(shell, compact);
        shell.querySelectorAll('.nav-submenu').forEach(details => {
            if (compact) {
                expandedStates.set(details, details.open);
                details.open = false;
            } else if (expandedStates.has(details)) {
                details.open = expandedStates.get(details);
                expandedStates.delete(details);
            }
        });
    };

    const positionPanel = (panel, trigger) => {
        const rail = trigger.closest('.app-shell__navigation').getBoundingClientRect();
        const anchor = trigger.getBoundingClientRect();
        const popup = panel.getBoundingClientRect();
        const rtl = getComputedStyle(trigger).direction === 'rtl';
        panel.style.left = `${Math.max(8, Math.min(innerWidth - popup.width - 8, rtl ? rail.left - popup.width - 8 : rail.right + 8))}px`;
        panel.style.top = `${Math.max(8, Math.min(innerHeight - popup.height - 8, anchor.top + (anchor.height - popup.height) / 2))}px`;
    };

    const showTooltip = target => {
        const trigger = target?.closest('.nav-item, [data-rail-trigger]');
        const shell = trigger?.closest('[data-app-shell]');
        if (!isRail(shell) || trigger.closest('[popover]') || flyout?.trigger === trigger) return;
        const panel = shell.querySelector('.app-shell__rail-tooltip');
        const label = trigger.querySelector('.nav-item__label, .nav-submenu__label')?.textContent.trim()
            || trigger.getAttribute('aria-label');
        if (!panel || !label) return;
        clearTimeout(hideTimer);
        if (tooltip?.trigger === trigger) return;
        hideTooltip();
        panel.textContent = label;
        panel.showPopover();
        positionPanel(panel, trigger);
        tooltip = { panel, trigger };
    };

    document.addEventListener('pointerover', event => {
        if (event.target.closest('.app-shell__rail-tooltip')) clearTimeout(hideTimer);
        else showTooltip(event.target);
    });
    document.addEventListener('pointerout', event => {
        if (!tooltip || tooltip.trigger.contains(event.relatedTarget) || tooltip.panel.contains(event.relatedTarget)) return;
        hideTimer = setTimeout(() => {
            if (!tooltip?.trigger.contains(document.activeElement)) hideTooltip();
        }, 120);
    });
    document.addEventListener('focusin', event => showTooltip(event.target));
    document.addEventListener('focusout', event => {
        if (tooltip?.trigger === event.target) hideTooltip();
    });

    document.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target : null;
        const shell = target?.closest('[data-app-shell]');
        if (target?.closest('[data-shell-action="desktop"]')) {
            hideTooltip();
            closeFlyout();
            synchronizeRail(shell);
            return;
        }
        const trigger = target?.closest('[data-rail-trigger]');
        if (trigger && isRail(shell)) {
            event.preventDefault();
            hideTooltip();
            if (flyout?.trigger === trigger) { closeFlyout(); return; }
            closeFlyout();
            const panel = trigger.parentElement.querySelector('[data-rail-panel]');
            const details = trigger.closest('.nav-submenu');
            if (details) details.open = true;
            else trigger.setAttribute('aria-expanded', 'true');
            panel.setAttribute('popover', 'auto');
            flyout = { panel, trigger, details };
            panel.addEventListener('toggle', onFlyoutToggle);
            panel.showPopover();
            positionPanel(panel, trigger);
            if (event.detail === 0) panel.querySelector('a, button, input, select, textarea')?.focus();
        } else if (target?.closest('.app-shell__navigation a')) {
            hideTooltip();
            closeFlyout();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || event.defaultPrevented) return;
        if (flyout) {
            // A nested application-owned popup consumes its own first Escape.
            const nested = event.target.closest('[popover]:popover-open, dialog[open]');
            if (nested && nested !== flyout.panel) return;
            event.preventDefault();
            closeFlyout(true);
            hideTooltip();
        } else if (tooltip) {
            event.preventDefault();
            hideTooltip();
        }
    });
    const reset = () => {
        hideTooltip();
        closeFlyout();
        document.querySelectorAll('[data-app-shell]').forEach(synchronizeRail);
    };
    addEventListener('resize', reset);
    addEventListener('popstate', reset);
    document.addEventListener('scroll', event => {
        if (flyout?.panel.contains(event.target)) return;
        hideTooltip();
        if (flyout) positionPanel(flyout.panel, flyout.trigger);
    }, true);

    const watchShells = () => {
        // Routed shells can be replaced without a document navigation. Observe
        // their container even with no overlay open, and release detached ones.
        for (const shell of observedShells) {
            if (!shell.isConnected) {
                shellObserver.unobserve(shell);
                observedShells.delete(shell);
            }
        }
        if (tooltip && !tooltip.trigger.isConnected) hideTooltip();
        if (flyout && !flyout.trigger.isConnected) closeFlyout();
        document.querySelectorAll('[data-app-shell]').forEach(shell => {
            if (observedShells.has(shell)) return;
            observedShells.add(shell);
            shellObserver.observe(shell);
        });
    };
    new MutationObserver(watchShells).observe(document.documentElement, { childList: true, subtree: true });
    watchShells();
})();
