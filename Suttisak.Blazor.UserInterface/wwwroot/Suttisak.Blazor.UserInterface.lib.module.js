let formControlObserver;

function parseLocalDateTime(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value ?? "");
    if (!match) return null;
    const parts = match.slice(1, 6).map(Number);
    const seconds = match[6] ? Number(match[6]) : 0;
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], seconds, 0);
    const roundTrips = date.getFullYear() === parts[0]
        && date.getMonth() === parts[1] - 1
        && date.getDate() === parts[2]
        && date.getHours() === parts[3]
        && date.getMinutes() === parts[4]
        && date.getSeconds() === seconds;
    return roundTrips ? date : null;
}

function hasAmbiguousOffset(date) {
    const sameWallTime = candidate => candidate.getFullYear() === date.getFullYear()
        && candidate.getMonth() === date.getMonth()
        && candidate.getDate() === date.getDate()
        && candidate.getHours() === date.getHours()
        && candidate.getMinutes() === date.getMinutes();
    const before = new Date(date.getTime() - 2 * 60 * 60 * 1000);
    const after = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const offsetDelta = Math.abs(before.getTimezoneOffset() - after.getTimezoneOffset());
    if (offsetDelta === 0) return false;
    return sameWallTime(new Date(date.getTime() - offsetDelta * 60 * 1000))
        || sameWallTime(new Date(date.getTime() + offsetDelta * 60 * 1000));
}

function enhanceDateTimeControl(control) {
    if (control.dataset.browserDateTimeReady === "true") return;
    control.dataset.browserDateTimeReady = "true";

    const localInput = control.querySelector("[data-browser-local-datetime]");
    const utcInput = control.querySelector("[data-browser-utc-datetime]");
    const timeZoneInput = control.querySelector("[data-browser-timezone-id]");
    const offsetInput = control.querySelector("[data-browser-offset-minutes]");
    const timeZoneLabel = control.querySelector("[data-browser-timezone-label]");
    const error = control.querySelector("[data-browser-datetime-error]");
    if (!localInput || !utcInput || !timeZoneInput || !offsetInput) return;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    timeZoneInput.value = timeZone;
    if (timeZoneLabel) timeZoneLabel.textContent = timeZone;

    const synchronize = () => {
        localInput.setCustomValidity("");
        if (error) error.textContent = "";
        utcInput.value = "";
        offsetInput.value = "";
        if (!localInput.value) return;

        const date = parseLocalDateTime(localInput.value);
        if (!date) {
            const message = "This local time does not exist in the browser time zone.";
            localInput.setCustomValidity(message);
            if (error) error.textContent = message;
            return;
        }
        if (hasAmbiguousOffset(date)) {
            const message = "This local time occurs twice when the clock changes. Choose another time.";
            localInput.setCustomValidity(message);
            if (error) error.textContent = message;
            return;
        }

        utcInput.value = date.toISOString();
        offsetInput.value = String(-date.getTimezoneOffset());
    };

    localInput.addEventListener("input", synchronize);
    localInput.addEventListener("change", synchronize);
    synchronize();
}

function formatCalendarDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseCalendarDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function formatPickerTime(date, includeSeconds = false) {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return includeSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
}

function parsePickerTime(value) {
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? "");
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] ?? 0);
    return hour < 24 && minute < 60 && second < 60 ? { hour, minute, second } : null;
}

function updatePickerInput(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionPickerPopup(popup, trigger, preferredWidth) {
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(preferredWidth, window.innerWidth - 16);
    popup.style.width = `${width}px`;
    popup.style.left = `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`;
    popup.style.top = `${Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - popup.offsetHeight - 8))}px`;
    popup.style.margin = "0";
}

function enhanceCalendarControl(control) {
    if (control.dataset.appCalendar !== "popup" || control.dataset.calendarReady === "true") return;
    if (!("showPopover" in HTMLElement.prototype)) return;
    const input = control.querySelector('input[type="date"]');
    const trigger = control.querySelector("[data-calendar-trigger]");
    if (!input || !trigger) return;

    control.dataset.calendarReady = "true";
    control.classList.add("is-popup-ready");
    const firstDay = Number(control.dataset.calendarFirstDay ?? 1);
    let visibleMonth = parseCalendarDate(input.value) ?? new Date();
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);

    const popup = document.createElement("div");
    popup.className = "app-calendar-popup";
    // Auto popovers provide native light-dismiss and Escape behavior without a
    // Blazor event handler, so this enhancement also works on static SSR pages.
    popup.setAttribute("popover", "auto");
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "false");
    popup.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Calendar");
    popup.innerHTML = `
        <div class="app-calendar-popup__header">
            <button class="app-calendar-popup__nav" type="button" data-calendar-previous aria-label="Previous month">‹</button>
            <div class="app-calendar-popup__period">
                <select class="app-calendar-popup__period-select" data-calendar-month aria-label="Month"></select>
                <select class="app-calendar-popup__period-select app-calendar-popup__period-select--year" data-calendar-year aria-label="Year"></select>
            </div>
            <span class="app-calendar-popup__announcement" aria-live="polite"></span>
            <button class="app-calendar-popup__nav" type="button" data-calendar-next aria-label="Next month">›</button>
        </div>
        <div class="app-calendar-popup__weekdays" aria-hidden="true"></div>
        <div class="app-calendar-popup__days"></div>`;
    control.append(popup);

    const announcement = popup.querySelector(".app-calendar-popup__announcement");
    const monthSelect = popup.querySelector("[data-calendar-month]");
    const yearSelect = popup.querySelector("[data-calendar-year]");
    const weekdays = popup.querySelector(".app-calendar-popup__weekdays");
    const days = popup.querySelector(".app-calendar-popup__days");
    const todayValue = formatCalendarDate(new Date());
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
    const monthNameFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

    for (let month = 0; month < 12; month++) {
        const option = document.createElement("option");
        option.value = String(month);
        option.textContent = monthNameFormatter.format(new Date(2024, month, 1));
        monthSelect.append(option);
    }
    const minimumYear = parseCalendarDate(input.min)?.getFullYear() ?? visibleMonth.getFullYear() - 100;
    const maximumYear = parseCalendarDate(input.max)?.getFullYear() ?? visibleMonth.getFullYear() + 100;
    for (let year = maximumYear; year >= minimumYear; year--) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = new Intl.NumberFormat(undefined, { useGrouping: false }).format(year);
        yearSelect.append(option);
    }

    for (let index = 0; index < 7; index++) {
        const weekday = document.createElement("span");
        weekday.textContent = weekdayFormatter.format(new Date(2024, 0, 7 + ((firstDay + index) % 7)));
        weekdays.append(weekday);
    }

    const isAllowed = value => (!input.min || value >= input.min) && (!input.max || value <= input.max);
    const render = () => {
        announcement.textContent = monthFormatter.format(visibleMonth);
        monthSelect.value = String(visibleMonth.getMonth());
        yearSelect.value = String(visibleMonth.getFullYear());
        days.replaceChildren();
        const offset = (visibleMonth.getDay() - firstDay + 7) % 7;
        const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - offset);
        for (let index = 0; index < 42; index++) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            const value = formatCalendarDate(date);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "app-calendar-popup__day";
            button.textContent = String(date.getDate());
            button.dataset.value = value;
            button.tabIndex = value === input.value ? 0 : -1;
            button.setAttribute("aria-label", new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date));
            if (date.getMonth() !== visibleMonth.getMonth()) button.classList.add("is-outside");
            if (value === todayValue) button.classList.add("is-today");
            if (value === input.value) { button.classList.add("is-selected"); button.setAttribute("aria-current", "date"); }
            button.disabled = !isAllowed(value);
            days.append(button);
        }
    };

    const close = () => {
        if (popup.matches(":popover-open")) popup.hidePopover();
        trigger.setAttribute("aria-expanded", "false");
    };
    const position = () => positionPickerPopup(popup, trigger, 320);

    trigger.addEventListener("click", () => {
        if (popup.matches(":popover-open")) { close(); return; }
        const selected = parseCalendarDate(input.value);
        if (selected) visibleMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
        render();
        popup.showPopover();
        trigger.setAttribute("aria-expanded", "true");
        position();
        (popup.querySelector(".is-selected:not(:disabled)")
            ?? popup.querySelector(".app-calendar-popup__day:not(:disabled)"))?.focus();
    });
    popup.querySelector("[data-calendar-previous]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); render(); });
    popup.querySelector("[data-calendar-next]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); render(); });
    monthSelect.addEventListener("change", () => { visibleMonth = new Date(visibleMonth.getFullYear(), Number(monthSelect.value), 1); render(); });
    yearSelect.addEventListener("change", () => { visibleMonth = new Date(Number(yearSelect.value), visibleMonth.getMonth(), 1); render(); });
    days.addEventListener("click", event => {
        const button = event.target.closest("button[data-value]");
        if (!button || button.disabled) return;
        updatePickerInput(input, button.dataset.value);
        close();
        trigger.focus();
    });
    days.addEventListener("keydown", event => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        const increments = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        const increment = increments[event.key];
        if (!increment) return;
        event.preventDefault();
        const date = parseCalendarDate(button.dataset.value);
        date.setDate(date.getDate() + increment);
        const value = formatCalendarDate(date);
        let target = days.querySelector(`[data-value="${value}"]:not(:disabled)`);
        if (!target) {
            visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            render();
            target = days.querySelector(`[data-value="${value}"]:not(:disabled)`);
        }
        target?.focus();
    });
    popup.addEventListener("toggle", event => { if (event.newState === "closed") trigger.setAttribute("aria-expanded", "false"); });
    popup.addEventListener("keydown", event => { if (event.key === "Escape") { close(); trigger.focus(); } });
    input.addEventListener("change", render);
    render();
}

function populateNumberSelect(select, start, end, step = 1) {
    for (let value = start; value <= end; value += step) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value).padStart(2, "0");
        select.append(option);
    }
}

function enhanceTimeControl(control) {
    if (control.dataset.appTime !== "popup" || control.dataset.timeReady === "true") return;
    if (!("showPopover" in HTMLElement.prototype)) return;
    const input = control.querySelector('input[type="time"]');
    const trigger = control.querySelector("[data-time-trigger]");
    if (!input || !trigger) return;

    control.dataset.timeReady = "true";
    control.classList.add("is-popup-ready");
    const minuteStep = Math.max(1, Number(control.dataset.timeMinuteStep ?? 1));
    const secondStep = Math.max(1, Number(control.dataset.timeSecondStep ?? 1));
    const includeSeconds = control.dataset.timeIncludeSeconds === "true";
    const popup = document.createElement("div");
    popup.className = "app-picker-popup app-time-popup";
    popup.setAttribute("popover", "auto");
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "false");
    popup.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Time picker");
    popup.innerHTML = `
        <div class="app-picker-popup__heading">
            <span class="app-picker-popup__heading-icon" aria-hidden="true">◷</span>
            <div><strong>Choose time</strong><small>Browser local time</small></div>
        </div>
        <div class="app-time-popup__fields">
            <label><span>Hour</span><select data-time-hour aria-label="Hour"></select></label>
            <b aria-hidden="true">:</b>
            <label><span>Minute</span><select data-time-minute aria-label="Minute"></select></label>
            ${includeSeconds ? '<b aria-hidden="true">:</b><label><span>Second</span><select data-time-second aria-label="Second"></select></label>' : ""}
        </div>
        <div class="app-picker-popup__actions">
            <button class="app-picker-popup__button app-picker-popup__button--quiet" type="button" data-time-now>Now</button>
            <span></span>
            <button class="app-picker-popup__button app-picker-popup__button--quiet" type="button" data-picker-cancel>Cancel</button>
            <button class="app-picker-popup__button app-picker-popup__button--primary" type="button" data-picker-apply>Apply</button>
        </div>`;
    control.append(popup);

    const hourSelect = popup.querySelector("[data-time-hour]");
    const minuteSelect = popup.querySelector("[data-time-minute]");
    const secondSelect = popup.querySelector("[data-time-second]");
    const applyButton = popup.querySelector("[data-picker-apply]");
    populateNumberSelect(hourSelect, 0, 23);
    populateNumberSelect(minuteSelect, 0, 59, minuteStep);
    if (secondSelect) populateNumberSelect(secondSelect, 0, 59, secondStep);

    const setSelectors = value => {
        const parsed = parsePickerTime(value) ?? { hour: new Date().getHours(), minute: Math.floor(new Date().getMinutes() / minuteStep) * minuteStep, second: 0 };
        hourSelect.value = String(parsed.hour);
        minuteSelect.value = String(Math.floor(parsed.minute / minuteStep) * minuteStep);
        if (secondSelect) secondSelect.value = String(Math.floor(parsed.second / secondStep) * secondStep);
    };
    const candidateValue = () => {
        const date = new Date(2000, 0, 1, Number(hourSelect.value), Number(minuteSelect.value), Number(secondSelect?.value ?? 0));
        return formatPickerTime(date, includeSeconds);
    };
    const updateApplyState = () => {
        const candidate = candidateValue();
        applyButton.disabled = Boolean((input.min && candidate < input.min) || (input.max && candidate > input.max));
    };
    const close = () => {
        if (popup.matches(":popover-open")) popup.hidePopover();
        trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", () => {
        if (popup.matches(":popover-open")) { close(); return; }
        setSelectors(input.value);
        updateApplyState();
        popup.showPopover();
        trigger.setAttribute("aria-expanded", "true");
        positionPickerPopup(popup, trigger, 300);
        hourSelect.focus();
    });
    popup.querySelectorAll("select").forEach(select => select.addEventListener("change", updateApplyState));
    popup.querySelector("[data-time-now]").addEventListener("click", () => { setSelectors(formatPickerTime(new Date(), includeSeconds)); updateApplyState(); });
    popup.querySelector("[data-picker-cancel]").addEventListener("click", () => { close(); trigger.focus(); });
    applyButton.addEventListener("click", () => { updatePickerInput(input, candidateValue()); close(); trigger.focus(); });
    popup.addEventListener("toggle", event => { if (event.newState === "closed") trigger.setAttribute("aria-expanded", "false"); });
    popup.addEventListener("keydown", event => { if (event.key === "Escape") { close(); trigger.focus(); } });
}

function enhanceDateTimePicker(control) {
    if (control.dataset.appDatetime !== "popup" || control.dataset.dateTimePickerReady === "true") return;
    if (!("showPopover" in HTMLElement.prototype)) return;
    const input = control.querySelector('input[type="datetime-local"]');
    const trigger = control.querySelector("[data-datetime-trigger]");
    if (!input || !trigger) return;

    control.dataset.dateTimePickerReady = "true";
    control.classList.add("is-popup-ready");
    const firstDay = Number(control.dataset.calendarFirstDay ?? 1);
    const minuteStep = Math.max(1, Number(control.dataset.timeMinuteStep ?? 1));
    const secondStep = Math.max(1, Number(control.dataset.timeSecondStep ?? 1));
    const includeSeconds = control.dataset.timeIncludeSeconds === "true";
    let selectedDateTime = parseLocalDateTime(input.value) ?? new Date();
    let visibleMonth = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), 1);

    const popup = document.createElement("div");
    popup.className = "app-calendar-popup app-datetime-popup";
    popup.setAttribute("popover", "auto");
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-modal", "false");
    popup.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Date and time picker");
    popup.innerHTML = `
        <div class="app-calendar-popup__header">
            <button class="app-calendar-popup__nav" type="button" data-calendar-previous aria-label="Previous month">‹</button>
            <div class="app-calendar-popup__period">
                <select class="app-calendar-popup__period-select" data-calendar-month aria-label="Month"></select>
                <select class="app-calendar-popup__period-select app-calendar-popup__period-select--year" data-calendar-year aria-label="Year"></select>
            </div>
            <span class="app-calendar-popup__announcement" aria-live="polite"></span>
            <button class="app-calendar-popup__nav" type="button" data-calendar-next aria-label="Next month">›</button>
        </div>
        <div class="app-calendar-popup__weekdays" aria-hidden="true"></div>
        <div class="app-calendar-popup__days"></div>
        <div class="app-datetime-popup__time" aria-label="Time">
            <span class="app-datetime-popup__time-icon" aria-hidden="true">◷</span>
            <label><span>Hour</span><select data-time-hour aria-label="Hour"></select></label>
            <b aria-hidden="true">:</b>
            <label><span>Minute</span><select data-time-minute aria-label="Minute"></select></label>
            ${includeSeconds ? '<b aria-hidden="true">:</b><label><span>Second</span><select data-time-second aria-label="Second"></select></label>' : ""}
        </div>
        <div class="app-picker-popup__actions">
            <button class="app-picker-popup__button app-picker-popup__button--quiet" type="button" data-datetime-now>Now</button>
            <span></span>
            <button class="app-picker-popup__button app-picker-popup__button--quiet" type="button" data-picker-cancel>Cancel</button>
            <button class="app-picker-popup__button app-picker-popup__button--primary" type="button" data-picker-apply>Apply</button>
        </div>`;
    control.append(popup);

    const monthSelect = popup.querySelector("[data-calendar-month]");
    const yearSelect = popup.querySelector("[data-calendar-year]");
    const announcement = popup.querySelector(".app-calendar-popup__announcement");
    const weekdays = popup.querySelector(".app-calendar-popup__weekdays");
    const days = popup.querySelector(".app-calendar-popup__days");
    const hourSelect = popup.querySelector("[data-time-hour]");
    const minuteSelect = popup.querySelector("[data-time-minute]");
    const secondSelect = popup.querySelector("[data-time-second]");
    const applyButton = popup.querySelector("[data-picker-apply]");
    const todayValue = formatCalendarDate(new Date());
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
    const monthNameFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

    for (let month = 0; month < 12; month++) {
        const option = document.createElement("option");
        option.value = String(month);
        option.textContent = monthNameFormatter.format(new Date(2024, month, 1));
        monthSelect.append(option);
    }
    const minimumYear = parseLocalDateTime(input.min)?.getFullYear() ?? visibleMonth.getFullYear() - 100;
    const maximumYear = parseLocalDateTime(input.max)?.getFullYear() ?? visibleMonth.getFullYear() + 100;
    for (let year = maximumYear; year >= minimumYear; year--) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = new Intl.NumberFormat(undefined, { useGrouping: false }).format(year);
        yearSelect.append(option);
    }
    for (let index = 0; index < 7; index++) {
        const weekday = document.createElement("span");
        weekday.textContent = weekdayFormatter.format(new Date(2024, 0, 7 + ((firstDay + index) % 7)));
        weekdays.append(weekday);
    }
    populateNumberSelect(hourSelect, 0, 23);
    populateNumberSelect(minuteSelect, 0, 59, minuteStep);
    if (secondSelect) populateNumberSelect(secondSelect, 0, 59, secondStep);

    const selectedDateValue = () => formatCalendarDate(selectedDateTime);
    const candidateValue = () => `${selectedDateValue()}T${formatPickerTime(new Date(2000, 0, 1, Number(hourSelect.value), Number(minuteSelect.value), Number(secondSelect?.value ?? 0)), includeSeconds)}`;
    const isDateAllowed = value => (!input.min || value >= input.min.slice(0, 10)) && (!input.max || value <= input.max.slice(0, 10));
    const updateApplyState = () => {
        const candidate = candidateValue();
        applyButton.disabled = Boolean((input.min && candidate < input.min) || (input.max && candidate > input.max));
    };
    const setTimeSelectors = date => {
        hourSelect.value = String(date.getHours());
        minuteSelect.value = String(Math.floor(date.getMinutes() / minuteStep) * minuteStep);
        if (secondSelect) secondSelect.value = String(Math.floor(date.getSeconds() / secondStep) * secondStep);
    };
    const render = () => {
        announcement.textContent = monthFormatter.format(visibleMonth);
        monthSelect.value = String(visibleMonth.getMonth());
        yearSelect.value = String(visibleMonth.getFullYear());
        days.replaceChildren();
        const offset = (visibleMonth.getDay() - firstDay + 7) % 7;
        const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1 - offset);
        for (let index = 0; index < 42; index++) {
            const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
            const value = formatCalendarDate(date);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "app-calendar-popup__day";
            button.textContent = String(date.getDate());
            button.dataset.value = value;
            button.tabIndex = value === selectedDateValue() ? 0 : -1;
            button.setAttribute("aria-label", new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date));
            if (date.getMonth() !== visibleMonth.getMonth()) button.classList.add("is-outside");
            if (value === todayValue) button.classList.add("is-today");
            if (value === selectedDateValue()) { button.classList.add("is-selected"); button.setAttribute("aria-current", "date"); }
            button.disabled = !isDateAllowed(value);
            days.append(button);
        }
        updateApplyState();
    };
    const close = () => {
        if (popup.matches(":popover-open")) popup.hidePopover();
        trigger.setAttribute("aria-expanded", "false");
    };
    const resetFromInput = () => {
        selectedDateTime = parseLocalDateTime(input.value) ?? new Date();
        visibleMonth = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), 1);
        setTimeSelectors(selectedDateTime);
        render();
    };

    trigger.addEventListener("click", () => {
        if (popup.matches(":popover-open")) { close(); return; }
        resetFromInput();
        popup.showPopover();
        trigger.setAttribute("aria-expanded", "true");
        positionPickerPopup(popup, trigger, 340);
        (days.querySelector(".is-selected:not(:disabled)") ?? days.querySelector(".app-calendar-popup__day:not(:disabled)"))?.focus();
    });
    popup.querySelector("[data-calendar-previous]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); render(); });
    popup.querySelector("[data-calendar-next]").addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); render(); });
    monthSelect.addEventListener("change", () => { visibleMonth = new Date(visibleMonth.getFullYear(), Number(monthSelect.value), 1); render(); });
    yearSelect.addEventListener("change", () => { visibleMonth = new Date(Number(yearSelect.value), visibleMonth.getMonth(), 1); render(); });
    popup.querySelectorAll(".app-datetime-popup__time select").forEach(select => select.addEventListener("change", updateApplyState));
    days.addEventListener("click", event => {
        const button = event.target.closest("button[data-value]");
        if (!button || button.disabled) return;
        const date = parseCalendarDate(button.dataset.value);
        selectedDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), selectedDateTime.getHours(), selectedDateTime.getMinutes(), selectedDateTime.getSeconds());
        visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        render();
    });
    days.addEventListener("keydown", event => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        const increment = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
        if (!increment) return;
        event.preventDefault();
        const date = parseCalendarDate(button.dataset.value);
        date.setDate(date.getDate() + increment);
        const value = formatCalendarDate(date);
        let target = days.querySelector(`[data-value="${value}"]:not(:disabled)`);
        if (!target) { visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1); render(); target = days.querySelector(`[data-value="${value}"]:not(:disabled)`); }
        target?.focus();
    });
    popup.querySelector("[data-datetime-now]").addEventListener("click", () => { selectedDateTime = new Date(); visibleMonth = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), 1); setTimeSelectors(selectedDateTime); render(); });
    popup.querySelector("[data-picker-cancel]").addEventListener("click", () => { close(); trigger.focus(); });
    applyButton.addEventListener("click", () => { updatePickerInput(input, candidateValue()); close(); trigger.focus(); });
    popup.addEventListener("toggle", event => { if (event.newState === "closed") trigger.setAttribute("aria-expanded", "false"); });
    popup.addEventListener("keydown", event => { if (event.key === "Escape") { close(); trigger.focus(); } });
}

let adaptiveOverflowObserver;
const adaptiveOverflowResizeObservers = new WeakMap();
const adaptiveOverflowFrames = new WeakMap();

function measureAdaptiveOverflow(root) {
    if (!root.isConnected) return;

    root.removeAttribute("data-overflowing");
    const kind = root.dataset.adaptiveOverflow;
    let overflowing = false;

    if (kind === "section-navigation") {
        const desktop = root.querySelector(".section-navigation__desktop");
        const items = root.querySelector(".section-navigation__items");
        if (desktop && items && getComputedStyle(desktop).display !== "none") {
            overflowing = items.scrollWidth > desktop.clientWidth + 1;
        }
    } else if (kind === "page-action-toolbar") {
        const bounds = root.getBoundingClientRect();
        const inlineGroups = root.querySelectorAll(
            ":scope > .page-action-toolbar__supporting, " +
            ":scope > .page-action-toolbar__inline-overflow, " +
            ":scope > .page-action-toolbar__primary");
        overflowing = Array.from(inlineGroups).some(group => {
            if (getComputedStyle(group).display === "none") return false;
            const groupBounds = group.getBoundingClientRect();
            return groupBounds.left < bounds.left - 1 || groupBounds.right > bounds.right + 1;
        });
    }

    root.dataset.overflowReady = "true";
    if (overflowing) root.dataset.overflowing = "true";
    else {
        const selector = kind === "section-navigation"
            ? ":scope > .section-navigation__desktop > .section-navigation__overflow[open]"
            : ":scope > .page-action-toolbar__more[open]";
        root.querySelectorAll(selector).forEach(details => details.removeAttribute("open"));
    }
}

function queueAdaptiveOverflow(root) {
    const previous = adaptiveOverflowFrames.get(root);
    if (previous) cancelAnimationFrame(previous);
    adaptiveOverflowFrames.set(root, requestAnimationFrame(() => {
        adaptiveOverflowFrames.delete(root);
        measureAdaptiveOverflow(root);
    }));
}

function enhanceAdaptiveOverflow(root) {
    if (adaptiveOverflowResizeObservers.has(root)) {
        queueAdaptiveOverflow(root);
        return;
    }

    const resizeObserver = new ResizeObserver(() => queueAdaptiveOverflow(root));
    resizeObserver.observe(root);
    adaptiveOverflowResizeObservers.set(root, resizeObserver);
    queueAdaptiveOverflow(root);
}

function setupAdaptiveOverflow() {
    if (!document.documentElement) return;
    document.querySelectorAll("[data-adaptive-overflow]").forEach(enhanceAdaptiveOverflow);

    if (!adaptiveOverflowObserver) {
        adaptiveOverflowObserver = new MutationObserver(records => {
            const roots = new Set();
            for (const record of records) {
                if (record.target instanceof Element) {
                    const owner = record.target.closest("[data-adaptive-overflow]");
                    if (owner) roots.add(owner);
                }
                for (const node of record.addedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (node.matches("[data-adaptive-overflow]")) roots.add(node);
                    node.querySelectorAll?.("[data-adaptive-overflow]").forEach(root => roots.add(root));
                }
            }
            roots.forEach(enhanceAdaptiveOverflow);
        });
        adaptiveOverflowObserver.observe(document.documentElement, { childList: true, subtree: true });
        document.fonts?.ready.then(() => document.querySelectorAll("[data-adaptive-overflow]").forEach(queueAdaptiveOverflow));
    }
}

function setupFormControls() {
    if (!document.documentElement) return;
    document.querySelectorAll("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
    document.querySelectorAll("[data-app-calendar]").forEach(enhanceCalendarControl);
    document.querySelectorAll("[data-app-time]").forEach(enhanceTimeControl);
    document.querySelectorAll("[data-app-datetime]").forEach(enhanceDateTimePicker);
    if (formControlObserver) return;
    formControlObserver = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches("[data-browser-datetime-control]")) enhanceDateTimeControl(node);
                node.querySelectorAll?.("[data-browser-datetime-control]").forEach(enhanceDateTimeControl);
                if (node.matches("[data-app-calendar]")) enhanceCalendarControl(node);
                node.querySelectorAll?.("[data-app-calendar]").forEach(enhanceCalendarControl);
                if (node.matches("[data-app-time]")) enhanceTimeControl(node);
                node.querySelectorAll?.("[data-app-time]").forEach(enhanceTimeControl);
                if (node.matches("[data-app-datetime]")) enhanceDateTimePicker(node);
                node.querySelectorAll?.("[data-app-datetime]").forEach(enhanceDateTimePicker);
            }
        }
    });
    formControlObserver.observe(document.documentElement, { childList: true, subtree: true });
}

export function beforeStart() {
    setupFormControls();
    setupAdaptiveOverflow();
}

export function afterStarted() {
    setupFormControls();
    setupAdaptiveOverflow();
}

export function beforeWebStart() {
    setupFormControls();
    setupAdaptiveOverflow();
}

export function afterWebStarted() {
    setupFormControls();
    setupAdaptiveOverflow();
}
