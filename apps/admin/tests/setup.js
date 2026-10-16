window.matchMedia = () => ({
  matches: false,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});
const original = window.getComputedStyle;
window.getComputedStyle = (element) => original(element);
