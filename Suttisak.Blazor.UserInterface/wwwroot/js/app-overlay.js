const initialized = new WeakSet();

function initialize(element) {
    if (initialized.has(element)) return;
    initialized.add(element);

    element.addEventListener("cancel", event => {
        if (element.dataset.dismissible !== "true") event.preventDefault();
    });

    element.addEventListener("click", event => {
        if (event.target === element
            && element.dataset.dismissible === "true"
            && element.dataset.preventOutsideDismiss !== "true") element.close();
    });
}

export function showModal(element) {
    initialize(element);
    if (!element.open) element.showModal();
}

export function close(element) {
    if (element.open) element.close();
}
