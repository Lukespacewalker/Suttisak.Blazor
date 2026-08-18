window.playbookTheme = {
    setPrimaryColor(color) {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    },

    prefersDark() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
