const observers = new WeakMap();

// Keep QuickGrid mounted as the sole data engine. Resizing changes presentation only.
export function observe(element, breakpoint) {
    const existing = observers.get(element);
    if (existing) {
        existing.breakpoint = breakpoint;
        existing.update();
        return;
    }
    const state = { breakpoint, observer: null, update: null, lastFocused: null, dialog: null };
    state.rememberFocus = event => { state.lastFocused = event.target; };
    state.restoreFocus = () => {
        // A native dialog may close after its opener's view was hidden by resize.
        // Leave explicit focus restoration by the application alone.
        if (element.isConnected && state.lastFocused && !state.lastFocused.getClientRects().length
            && (document.activeElement === document.body || document.activeElement === state.lastFocused)) {
            element.focus({ preventScroll: true });
        }
        state.dialog = null;
    };
    element.addEventListener('focusin', state.rememberFocus);
    state.update = () => {
        const compact = element.getBoundingClientRect().width < state.breakpoint;
        const next = String(compact);
        if (element.dataset.compact === next) return;
        const active = document.activeElement;
        const hiddenView = element.querySelector(compact ? '.app-grid__table-view' : '.app-grid__cards-view');
        const moveFocus = active && hiddenView?.contains(active);
        const dialog = active?.closest('dialog[open]');
        if (dialog && hiddenView?.contains(state.lastFocused) && state.dialog !== dialog) {
            state.dialog?.removeEventListener('close', state.restoreFocus);
            state.dialog = dialog;
            dialog.addEventListener('close', state.restoreFocus, { once: true });
        }
        element.dataset.compact = next;
        if (moveFocus) element.focus({ preventScroll: true });
    };
    state.observer = new ResizeObserver(state.update);
    observers.set(element, state);
    state.observer.observe(element);
    state.update();
}

export function disconnect(element) {
    const state = observers.get(element);
    state?.observer.disconnect();
    if (state) {
        element.removeEventListener('focusin', state.rememberFocus);
        state.dialog?.removeEventListener('close', state.restoreFocus);
    }
    observers.delete(element);
    delete element.dataset.compact;
}
