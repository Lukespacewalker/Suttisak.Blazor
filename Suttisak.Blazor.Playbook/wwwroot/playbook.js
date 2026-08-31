window.playbookTheme = {
    setPrimaryColor(color) {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    },

    prefersDark() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
};

window.playbookFocus = {
    focusById(id) {
        document.getElementById(id)?.focus();
    }
};

window.playbookMotion = {
    observer: null,

    observeScrollReveals(rootSelector) {
        this.disconnect();

        const elements = [...document.querySelectorAll('.landing-reveal')];
        if (!elements.length) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('is-visible'));
            return;
        }

        elements.forEach((element, index) => {
            element.classList.add('is-reveal-ready');
            element.style.setProperty('--landing-reveal-order', Math.min(index, 3));
        });

        this.observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('is-visible');
                this.observer?.unobserve(entry.target);
            }
        }, {
            root: document.querySelector(rootSelector),
            threshold: 0.08,
            rootMargin: '0px 0px -8% 0px'
        });

        elements.forEach(element => this.observer.observe(element));
    },

    disconnect() {
        this.observer?.disconnect();
        this.observer = null;
    }
};

window.playbookLoader = (() => {
    const status = () => document.getElementById("playbook-loading-status");
    const detail = () => document.getElementById("playbook-loading-detail");
    const progress = () => document.getElementById("playbook-loading-progress");
    let completedResources = 0;
    let knownTotalBytes = 0;
    let receivedBytes = 0;
    let displayedPercent = 0;

    function setState(message, detailMessage, percent) {
        status()?.replaceChildren(message);
        detail()?.replaceChildren(detailMessage);

        if (typeof percent === "number") {
            displayedPercent = Math.max(displayedPercent, Math.min(100, Math.round(percent)));
            progress()?.style.setProperty("--playbook-load-progress", `${displayedPercent}%`);
        }
    }

    function reportProgress() {
        const percent = knownTotalBytes > 0 ? (receivedBytes / knownTotalBytes) * 100 : undefined;
        setState("Downloading the workspace…", `Loaded ${completedResources} application resource${completedResources === 1 ? "" : "s"}`, percent);
    }

    function loadBootResource(type, name, defaultUri, integrity) {
        // .NET 10 requires a URI for the dotnetjs runtime resource. Other boot
        // resources can be streamed as Responses to report loading progress.
        if (type === "dotnetjs") {
            return defaultUri;
        }

        return (async () => {
            const response = await fetch(defaultUri, { integrity, cache: "no-cache" });
            const contentLength = Number(response.headers.get("content-length"));

            if (!response.body || !Number.isFinite(contentLength) || contentLength <= 0) {
                completedResources++;
                reportProgress();
                return response;
            }

            knownTotalBytes += contentLength;
            const reader = response.body.getReader();
            const stream = new ReadableStream({
                async pull(controller) {
                    const { done, value } = await reader.read();
                    if (done) {
                        completedResources++;
                        reportProgress();
                        controller.close();
                        return;
                    }

                    receivedBytes += value.byteLength;
                    reportProgress();
                    controller.enqueue(value);
                },
                cancel(reason) {
                    return reader.cancel(reason);
                }
            });

            return new Response(stream, {
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            });
        })();
    }

    return {
        start() {
            setState("Starting the component workspace…", "Loading application resources", 4);
            Blazor.start({ loadBootResource })
                .then(() => setState("Ready", "Opening the playbook", 100))
                .catch(() => setState("We couldn't load the playbook.", "Check your connection, then refresh the page.", 100));
        }
    };
})();
