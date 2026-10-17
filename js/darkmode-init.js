import DarkMode from './darkmode.js';

// Initialize dark mode toggle when module is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    DarkMode.init();
  } catch (e) {
    console.warn('DarkMode init failed', e);
  }
});
