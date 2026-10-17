document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const regMsg = document.getElementById('register-message');

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value || '';
    regMsg.textContent = '';
    if (!name || !age || !email || !password) return;
    // Try server-side registration first
    try {
      const resp = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, email, password })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success) {
          regMsg.textContent = 'Registration successful! Redirecting to login...';
          regForm.reset();
          setTimeout(() => { window.location.href = 'login.html'; }, 800);
          return;
        } else {
          regMsg.textContent = json.message || 'Registration failed.';
          return;
        }
      }
    } catch (err) {
      console.warn('Server registration not available, falling back to localStorage', err);
    }

    // Client-side fallback (demo only) — stores user locally. Not secure for production.
    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      if (users.find(u => u.email === email)) {
        regMsg.textContent = 'Email already registered. Please login.';
        return;
      }
      // NOTE: storing password in localStorage is insecure; this is a demo fallback only.
      users.push({ name, age, email, password, createdAt: Date.now() });
      localStorage.setItem('users', JSON.stringify(users));
      regMsg.textContent = 'Registration (demo) successful! Redirecting to login...';
      regForm.reset();
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
    } catch (err) {
      console.error('Registration error:', err);
      regMsg.textContent = 'Registration failed (local storage error).';
    }
  });
});
