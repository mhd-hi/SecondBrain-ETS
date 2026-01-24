// Small helper via window events
export const openCommandPalette = () => {
  window.dispatchEvent(new CustomEvent('command-palette:open'));
};
