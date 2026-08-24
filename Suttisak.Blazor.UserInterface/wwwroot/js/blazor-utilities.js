window.blazorCulture = {
    storageKey: "BlazorCulture",

    get() {
        try {
            return window.localStorage.getItem(this.storageKey);
        } catch {
            return null;
        }
    },

    set(cultureName) {
        try {
            window.localStorage.setItem(this.storageKey, cultureName);
        } catch {
            // The current page can still apply the culture when storage is unavailable.
        }
    },

    clear() {
        try {
            window.localStorage.removeItem(this.storageKey);
        } catch {
            // There is no stored value to recover when storage is unavailable.
        }
    }
};

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
    if (needsSynchronization) synchronizeAppGridSelection();
});

appGridObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class']
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => synchronizeAppGridSelection(), { once: true });
} else {
    synchronizeAppGridSelection();
}
