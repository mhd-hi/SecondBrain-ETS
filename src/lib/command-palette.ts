// Small helper to open/close command palette via window events
export const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('command-palette:open'));
};

export const closeCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('command-palette:close'));
};
