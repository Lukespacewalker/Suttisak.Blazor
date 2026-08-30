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

// QuickGrid intentionally owns row rendering and does not expose row event
// attributes. AppGrid keeps its selection contract through delegated events so
// virtualized rows work without a per-row JS registration or retained object URL.
const appGridInteractiveSelector = 'a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]';

function synchronizeAppGridSelection(root = document) {
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
