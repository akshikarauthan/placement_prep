document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginMsg = document.getElementById('login-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value || '';
    loginMsg.textContent = '';
    if (!email || !password) return;

    // Try server-side password login first
    try {
      const resp = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success) {
          loginMsg.textContent = 'Login successful! Redirecting...';
          localStorage.setItem('session', JSON.stringify({ email, loggedAt: Date.now() }));
          setTimeout(() => { window.location.href = 'index.html'; }, 600);
          return;
        } else {
          loginMsg.textContent = json.message || 'Invalid credentials.';
          return;
        }
      }
    } catch (err) {
      console.warn('Server /api/login not available, falling back to local check', err);
    }

    // Client-side fallback (demo only)
    try {
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const user = users.find(u => u.email === email);
      if (!user) {
        loginMsg.textContent = 'Email not registered. Please register first.';
        return;
      }
      // If user was created by server previously, there may be no local password — fail in that case
      if (user.passwordHash && !user.password) {
        loginMsg.textContent = 'User exists on server only; please use server login.';
        return;
      }
      // Compare stored password (demo only)
      if (user.password !== password) {
        loginMsg.textContent = 'Invalid credentials.';
        return;
      }
      // success
      localStorage.setItem('session', JSON.stringify({ email, loggedAt: Date.now() }));
      loginMsg.textContent = 'Login successful (demo)! Redirecting...';
      setTimeout(() => { window.location.href = 'index.html'; }, 600);
    } catch (err) {
      console.error('Login error:', err);
      loginMsg.textContent = 'Login failed (local storage error).';
    }
  });
});
