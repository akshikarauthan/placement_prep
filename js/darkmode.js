const DarkMode = {
  init() {
    const toggle = document.createElement('button');
    toggle.id = 'dark-mode-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.className = 'btn btn-sm btn-outline-secondary';
    toggle.innerHTML = '🌙';

    // prefer placing toggle into the navbar if present
    const nav = document.querySelector('.navbar') || document.querySelector('nav');
    if (nav) {
      // place at the end of navbar links area
      // create wrapper to keep spacing
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';
      wrapper.appendChild(toggle);
      nav.appendChild(wrapper);
    } else {
      // fallback floating button
      toggle.style.position = 'fixed';
      toggle.style.bottom = '20px';
      toggle.style.right = '20px';
      toggle.style.zIndex = '1000';
      toggle.style.borderRadius = '50%';
      toggle.style.width = '50px';
      toggle.style.height = '50px';
      toggle.style.fontSize = '1.2rem';
      document.body.appendChild(toggle);
    }

    toggle.addEventListener('click', () => this.toggleDarkMode());
    
    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
      this.enableDarkMode();
    }
  },
  
  enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkMode', 'enabled');
    const el = document.getElementById('dark-mode-toggle');
    if (el) el.innerHTML = '☀️';
  },
  
  disableDarkMode() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('darkMode', 'disabled');
    const el = document.getElementById('dark-mode-toggle');
    if (el) el.innerHTML = '🌙';
  },
  
  toggleDarkMode() {
    if (localStorage.getItem('darkMode') !== 'enabled') {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }
};

export default DarkMode;