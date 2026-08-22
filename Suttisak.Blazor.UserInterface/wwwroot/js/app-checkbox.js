export function setIndeterminate(element, indeterminate) {
    if (!element) return;
    element.indeterminate = indeterminate === true;
}
