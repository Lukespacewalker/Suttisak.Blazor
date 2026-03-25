export function initScrollObserver(headerSelector, contentSelector) {
    const layout = document.querySelector("div.layout");
    if (!layout) return;

    // Usually the scroll happens on a container inside fluent-layout or window
    const bodyContent = document.querySelector(contentSelector) || document.querySelector("fluent-body-content") || window;
    const header = document.querySelector(headerSelector);

    if (!header) return;

    // ensure it has transition
    header.style.transition = "background-color 0.3s ease, backdrop-filter 0.3s ease, border-bottom-color 0.3s ease, box-shadow 0.3s ease";

    const onScroll = () => {
        const scrollTop = bodyContent !== window ? bodyContent.scrollTop : (window.scrollY || document.documentElement.scrollTop);
        if (scrollTop > 10) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
    };

    if (bodyContent !== window && typeof bodyContent.addEventListener === "function") {
        bodyContent.addEventListener("scroll", onScroll);
        // Sometimes Blazor fluent-body-content internal div scrolls instead
        const shadowScrollBox = bodyContent.shadowRoot ? bodyContent.shadowRoot.querySelector('.body-content') : null;
        if(shadowScrollBox) shadowScrollBox.addEventListener("scroll", onScroll);
    }
    window.addEventListener("scroll", onScroll);

    // Check initial state
    onScroll();
}