let isThemingSetup = false;

function setupTheming() {
    if (isThemingSetup) return;
    isThemingSetup = true;

    function getTheme() {
        const raw = localStorage.getItem("fluentui-blazor:theme-settings");
        if (!raw) return "system";
        try {
            const parsed = JSON.parse(raw);
            const mode = parsed?.mode;
            if (mode === "light") return "light";
            if (mode === "dark") return "dark";
            return "system";
        } catch {
            return "system";
        }
    }

    const targetNode = document.body;
    if (!targetNode) {
        // If body is not ready yet, wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', setupTheming);
        isThemingSetup = false;
        return;
    }

    const callback = (mutationsList) => {
        const theme = getTheme();
        const currentDataTheme = targetNode.getAttribute("data-theme");

        if (theme === "dark") {
            if (currentDataTheme !== "dark") {
                targetNode.setAttribute("data-theme", "dark");
            }
        } else if (theme === "light") {
            if (currentDataTheme !== "light") {
                targetNode.setAttribute("data-theme", "light");
            }
        } else {
            // "system" mode
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                if (currentDataTheme !== "dark") {
                    targetNode.setAttribute("data-theme", "dark");
                }
            } else {
                if (currentDataTheme != null) {
                    targetNode.removeAttribute("data-theme");
                }
            }
        }
    };

    const config = {
        subtree: true,
        childList: true,
        attributes: true,        // Required to watch attributes
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Run it once immediately to ensure correct initial state
    callback();
}

export function beforeWebStart() {
    setupTheming();
}