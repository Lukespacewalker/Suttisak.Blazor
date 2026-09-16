window.blazorCulture = {
    storageKey: "BlazorCulture",

    normalizePreference(value) {
        const normalized = String(value ?? "").trim().toLowerCase();
        if (normalized === "auto") return "auto";
        if (normalized === "en" || normalized.startsWith("en-")) return "en";
        if (normalized === "th" || normalized.startsWith("th-")) return "th";
        return null;
    },

    getPreference() {
        try {
            return this.normalizePreference(window.localStorage.getItem(this.storageKey)) ?? "auto";
        } catch {
            return "auto";
        }
    },

    get(defaultCulture = "en-US") {
        const preference = this.getPreference();
        if (preference === "en") return "en-US";
        if (preference === "th") return "th-TH";

        for (const language of navigator.languages ?? [navigator.language]) {
            const browserPreference = this.normalizePreference(language);
            if (browserPreference === "en") return "en-US";
            if (browserPreference === "th") return "th-TH";
        }
        return this.normalizePreference(defaultCulture) === "en" ? "en-US" : "th-TH";
    },

    set(value) {
        const preference = this.normalizePreference(value) ?? "auto";
        try {
            window.localStorage.setItem(this.storageKey, preference);
        } catch {
            // The current page can still apply the culture when storage is unavailable.
        }
        this.synchronizeSelectors();
    },

    clear() {
        try {
            window.localStorage.removeItem(this.storageKey);
        } catch {
            // There is no stored value to recover when storage is unavailable.
        }
        this.synchronizeSelectors();
    },

    synchronizeSelectors(root = document) {
        const preference = this.getPreference();
        root.querySelectorAll("[data-culture-selector]").forEach(selector => {
            selector.querySelectorAll("[data-culture-preference]").forEach(button => {
                const selected = button.dataset.culturePreference === preference;
                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
        });
    }
};

document.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target.closest("[data-culture-preference]") : null;
    if (target) window.blazorCulture.set(target.dataset.culturePreference);
});
addEventListener("storage", event => {
    if (event.key === window.blazorCulture.storageKey) window.blazorCulture.synchronizeSelectors();
});

window.downloadFileFromStream = async (fileName, contentStreamReference) => {
    const arrayBuffer = await contentStreamReference.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const url = URL.createObjectURL(blob);
    try {
        const anchorElement = document.createElement('a');
        anchorElement.href = url;
        anchorElement.download = fileName ?? '';
        anchorElement.click();
        anchorElement.remove();
    } finally {
        URL.revokeObjectURL(url);
    }
};

// Native popovers use the top layer, so row actions are not clipped by a
// scrolling grid. Keep native buttons/links and their normal Tab order.
const actionMenuSelector = '[data-app-action-menu]';
const actionMenuControlSelector = 'button:not(:disabled), a[href]:not([aria-disabled="true"])';
function actionMenuTrigger(menu) {
    return document.querySelector(`[popovertarget="${CSS.escape(menu.id)}"]`);
}
function positionActionMenu(menu) {
    const trigger = actionMenuTrigger(menu);
    if (!trigger) return;
    const anchor = trigger.getBoundingClientRect();
    const box = menu.getBoundingClientRect();
    const margin = 8;
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const left = rtl ? anchor.left : anchor.right - box.width;
    const below = anchor.bottom + 4;
    menu.style.left = `${Math.max(margin, Math.min(left, innerWidth - box.width - margin))}px`;
    menu.style.top = `${Math.max(margin, Math.min(below + box.height <= innerHeight - margin
        ? below : anchor.top - box.height - 4, innerHeight - box.height - margin))}px`;
}
document.addEventListener('toggle', event => {
    const menu = event.target;
    if (!(menu instanceof HTMLElement) || !menu.matches(actionMenuSelector)) return;
    if (event.newState === 'open') {
        positionActionMenu(menu);
        menu.querySelector(actionMenuControlSelector)?.focus({ preventScroll: true });
    }
}, true);
document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest(actionMenuControlSelector);
    const menu = control?.closest(`${actionMenuSelector}:popover-open`);
    // Close before Blazor invokes the application callback, which may open a
    // dialog and move focus. Never restore focus after that callback.
    if (menu) menu.hidePopover();
}, true);
document.addEventListener('focusout', event => {
    const menu = event.target instanceof Element ? event.target.closest(actionMenuSelector) : null;
    if (!menu) return;
    // Native focus transfer can run microtasks before activeElement is updated.
    // Moving between actions must not dismiss the popup before pointerup/click.
    if (event.relatedTarget instanceof Node && (menu.contains(event.relatedTarget)
        || event.relatedTarget === actionMenuTrigger(menu))) return;
    queueMicrotask(() => {
        if (menu.matches(':popover-open') && !menu.contains(document.activeElement)
            && document.activeElement !== actionMenuTrigger(menu)) menu.hidePopover();
    });
});
document.addEventListener('keydown', event => {
    const menu = event.target instanceof Element ? event.target.closest(`${actionMenuSelector}:popover-open`) : null;
    if (!menu || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const controls = [...menu.querySelectorAll(actionMenuControlSelector)];
    if (!controls.length) return;
    event.preventDefault();
    const index = controls.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length;
    controls[next].focus();
});
function repositionActionMenus(event) {
    document.querySelectorAll(`${actionMenuSelector}:popover-open`).forEach(menu => {
        if (event.target instanceof Node && menu.contains(event.target)) return;
        // Keyboard focus can smoothly scroll an offscreen trigger into view.
        // Keep the popup open throughout that scroll and clamp it to the viewport.
        if (!actionMenuTrigger(menu)) menu.hidePopover();
        else positionActionMenu(menu);
    });
}
document.addEventListener('scroll', repositionActionMenus, true);
window.addEventListener('resize', repositionActionMenus);

// QuickGrid intentionally owns row rendering and does not expose row event
// attributes. AppGrid keeps its selection contract through delegated events so
// virtualized rows work without a per-row JS registration or retained object URL.
const appGridInteractiveSelector = 'a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]';

function synchronizeAppGridSelection(root = document) {
    root.querySelectorAll('.app-grid--virtualized').forEach(grid => {
        const header = grid.querySelector('thead');
        if (header) grid.style.setProperty('--app-grid-header-height', `${header.offsetHeight + 4}px`);
    });
    root.querySelectorAll('.app-grid tbody tr').forEach(row => {
        const checkbox = row.querySelector('input.app-grid__checkbox[type="checkbox"]');
        if (!checkbox) {
            row.removeAttribute('tabindex');
            row.removeAttribute('aria-selected');
            return;
        }

        row.tabIndex = 0;
        row.setAttribute('aria-selected', row.classList.contains('is-selected') ? 'true' : 'false');
    });
}

window.addEventListener('resize', () => synchronizeAppGridSelection());

document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || event.target.closest(appGridInteractiveSelector)) return;
    const row = event.target.closest('.app-grid tbody tr');
    const checkbox = row?.querySelector('input.app-grid__checkbox[type="checkbox"]:not(:disabled)');
    checkbox?.click();
});

document.addEventListener('keydown', event => {
    if (!(event.target instanceof Element) || !event.target.matches('.app-grid tbody tr')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const checkbox = event.target.querySelector('input.app-grid__checkbox[type="checkbox"]:not(:disabled)');
    if (!checkbox) return;
    event.preventDefault();
    checkbox.click();
});

const appGridObserver = new MutationObserver(mutations => {
    const needsSynchronization = mutations.some(mutation =>
        mutation.type === 'childList' ||
        (mutation.type === 'attributes' && mutation.attributeName === 'class'));
    if (needsSynchronization) {
        synchronizeAppGridSelection();
        window.blazorCulture.synchronizeSelectors();
    }
});

appGridObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class']
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        synchronizeAppGridSelection();
        window.blazorCulture.synchronizeSelectors();
    }, { once: true });
} else {
    synchronizeAppGridSelection();
    window.blazorCulture.synchronizeSelectors();
}
