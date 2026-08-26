export function setIndeterminate(element, indeterminate) {
    if (!element) return;
    element.indeterminate = indeterminate === true;
}

export function setState(element, checked, indeterminate) {
    if (!element) return;
    element.checked = checked === true;
    element.indeterminate = indeterminate === true;
}
