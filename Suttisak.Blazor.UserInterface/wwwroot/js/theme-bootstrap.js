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

    document.addEventListener("click", event => {
        const target = event.target instanceof Element ? event.target : null;
        const themeButton = target?.closest("[data-theme-preference]");
        if (themeButton) setTheme(themeButton.dataset.themePreference);
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
            if (!isVisible(shellMenuButton(shell, 'mobile'))) setMobileNavigation(shell, false);
        }
    });
    const isRail = shell => shell?.querySelector('.app-shell__frame')?.classList.contains('is-desktop-collapsed')
        && shell.querySelector('[data-shell-action="desktop"]')?.getClientRects().length > 0;

    const shellMenuButton = (shell, mode) => shell.querySelector(`[data-shell-action="${mode}"]`);
    const isVisible = element => Boolean(element?.getClientRects().length)
        && getComputedStyle(element).visibility === 'visible';

    const setMobileNavigation = (shell, open, restoreFocus = false) => {
        const navigation = shell.querySelector('.app-shell__navigation');
        const trigger = shellMenuButton(shell, 'mobile');
        if (!navigation || !trigger || navigation.classList.contains('is-open') === open) return;

        trigger.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
        const label = open ? trigger.dataset.labelOpen : trigger.dataset.labelClosed;
        if (label) trigger.setAttribute('aria-label', label);
        if (restoreFocus && isVisible(trigger)) trigger.focus({ preventScroll: true });

        navigation.classList.toggle('is-open', open);
        shell.querySelector('.app-shell__scrim')?.classList.toggle('is-visible', open);
        if (!open) return;

        const previousFocus = document.activeElement;
        requestAnimationFrame(() => {
            if (!navigation.classList.contains('is-open') || !isVisible(trigger) || document.activeElement !== previousFocus) return;
            const controls = navigation.querySelectorAll('a[href], button, select, input, textarea, summary, [tabindex]');
            const firstControl = Array.from(controls).find(control => control.tabIndex >= 0
                && !control.matches(':disabled') && !control.closest('[inert]') && isVisible(control));
            (firstControl ?? navigation).focus({ preventScroll: true });
        });
    };

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
    document.addEventListener('focusin', event => {
        const target = event.target;
        const shell = target.closest('[data-app-shell]');
        const main = target.closest('.app-shell__main');
        if (shell && main?.closest('[data-app-shell]') === shell) setMobileNavigation(shell, false);
        showTooltip(target);
    });
    document.addEventListener('focusout', event => {
        if (tooltip?.trigger === event.target) hideTooltip();
        const target = event.target;
        if (event.relatedTarget || !target.closest('.app-shell__navigation, [data-shell-action]')) return;
        const shell = target.closest('[data-app-shell]');
        if (!shell) return;
        // A breakpoint can hide the focused control and drop focus to the document.
        requestAnimationFrame(() => {
            if (!shell.isConnected || document.activeElement !== document.body || isVisible(target)) return;
            const mobile = shellMenuButton(shell, 'mobile');
            const trigger = isVisible(mobile) ? mobile : shellMenuButton(shell, 'desktop');
            trigger?.focus({ preventScroll: true });
        });
    });

    document.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target : null;
        const shell = target?.closest('[data-app-shell]');
        if (!shell) return;
        const button = target.closest('[data-shell-action]');
        const action = button?.dataset.shellAction;
        if (action === 'desktop') {
            const collapsed = shell.querySelector('.app-shell__frame')?.classList.toggle('is-desktop-collapsed') ?? false;
            button.classList.toggle('is-open', !collapsed);
            button.setAttribute('aria-expanded', String(!collapsed));
            const label = collapsed ? button.dataset.labelClosed : button.dataset.labelOpen;
            if (label) button.setAttribute('aria-label', label);
            hideTooltip();
            closeFlyout();
            synchronizeRail(shell);
            return;
        }
        if (action === 'mobile') {
            const open = button.getAttribute('aria-expanded') === 'true';
            setMobileNavigation(shell, !open, open);
            return;
        }
        if (action === 'close') {
            setMobileNavigation(shell, false, true);
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
            setMobileNavigation(shell, false, true);
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
        } else {
            const target = event.target instanceof Element ? event.target : null;
            const shell = target?.closest('[data-app-shell]');
            if (!shell || !target.closest('.app-shell__navigation, [data-shell-action="mobile"]')) return;
            const navigation = shell.querySelector('.app-shell__navigation.is-open');
            if (!navigation || !isVisible(shellMenuButton(shell, 'mobile'))) return;
            // The first Escape belongs to a native popup, even when its invoker
            // retains focus.
            const openOverlay = '[popover]:popover-open, dialog[open]';
            if (target.closest(openOverlay) || navigation.querySelector(openOverlay)) return;
            event.preventDefault();
            setMobileNavigation(shell, false, true);
        }
    });
    const reset = () => {
        hideTooltip();
        closeFlyout();
        document.querySelectorAll('[data-app-shell]').forEach(synchronizeRail);
    };
    addEventListener('resize', reset);
    addEventListener('popstate', () => {
        reset();
        document.querySelectorAll('[data-app-shell]').forEach(shell => {
            const navigation = shell.querySelector('.app-shell__navigation');
            setMobileNavigation(shell, false, navigation?.contains(document.activeElement));
        });
    });
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
