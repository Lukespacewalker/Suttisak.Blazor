const storageKey = "suttisak-blazor:theme-settings";
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
const subscribers = new Map();
let nextSubscriptionId = 0;
let listenersAttached = false;

function normalizePreference(value) {
    const preference = String(value).toLowerCase();
    return preference === "light" || preference === "dark" ? preference : "system";
}

function getPreference() {
    try {
        return normalizePreference(JSON.parse(localStorage.getItem(storageKey) ?? "{}")?.mode);
    } catch {
        return "system";
    }
}

function resolveScheme(preference) {
    return preference === "dark" || preference === "system" && systemTheme.matches
        ? "dark"
        : "light";
}

function applyTheme(preference = getPreference()) {
    const normalizedPreference = normalizePreference(preference);
    const scheme = resolveScheme(normalizedPreference);
    const root = document.documentElement;

    if (root.getAttribute("data-theme") !== scheme) {
        root.setAttribute("data-theme", scheme);
    }

    return { preference: normalizedPreference, scheme };
}

function notifySubscribers(state) {
    for (const subscriber of subscribers.values()) {
        subscriber.invokeMethodAsync("UpdateTheme", state.preference, state.scheme).catch(() => {
            // A disposed interactive circuit is removed on component disposal.
        });
    }
}

function publishTheme() {
    const state = applyTheme();
    notifySubscribers(state);
    return state;
}

function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;

    systemTheme.addEventListener?.("change", () => {
        if (getPreference() === "system") publishTheme();
    });
    addEventListener("storage", event => {
        if (event.key === storageKey) publishTheme();
    });
}

export function subscribeTheme(subscriber) {
    const subscriptionId = ++nextSubscriptionId;
    subscribers.set(subscriptionId, subscriber);
    attachListeners();
    const state = applyTheme();
    subscriber.invokeMethodAsync("UpdateTheme", state.preference, state.scheme).catch(() => {
        subscribers.delete(subscriptionId);
    });
    return subscriptionId;
}

export function unsubscribeTheme(subscriptionId) {
    subscribers.delete(subscriptionId);
}

export function setTheme(preference) {
    const normalizedPreference = normalizePreference(preference);
    try {
        localStorage.setItem(storageKey, JSON.stringify({ mode: normalizedPreference }));
    } catch {
        // Applying the choice still works when persistent storage is unavailable.
    }

    const state = applyTheme(normalizedPreference);
    notifySubscribers(state);
    return state;
}
