/**
 * Creates a debounced version of a function that delays invoking it
 * until after `delay` ms have elapsed since the last call.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
