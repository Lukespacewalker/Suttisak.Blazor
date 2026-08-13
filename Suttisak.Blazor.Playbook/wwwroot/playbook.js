window.playbookTheme = {
    setPrimaryColor(color) {
        document.body?.setAttribute("data-theme-color", color);
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
    }
};
