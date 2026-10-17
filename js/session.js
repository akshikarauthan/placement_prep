document.addEventListener('DOMContentLoaded', () => {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;

  function loadSession() {
    try { const s = localStorage.getItem('session'); return s ? JSON.parse(s) : null; } catch(e){ return null; }
  }
  function loadUsers(){
    try{ const raw = localStorage.getItem('users'); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }

  const session = loadSession();
  if (!session || !session.email) {
    // show login/register links
    navUser.innerHTML = `<a href="login.html" style="margin-right:10px;">Login</a> <a href="register.html">Register</a>`;
    return;
  }

  const users = loadUsers();
  const me = users.find(u => u.email === session.email);
  const displayName = me ? (me.name || me.email) : session.email;

  navUser.innerHTML = `<span style="margin-right:10px">Hello, ${escapeHtml(displayName)}</span> <button id="nav-logout" class="btn btn-sm" style="padding:6px 8px;border-radius:6px;background:#e74c3c;color:#fff;border:none;cursor:pointer">Logout</button>`;

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('session');
      // optional: keep other local data
      window.location.href = 'login.html';
    });
  }

  // small helper to avoid XSS when inserting user-provided strings
  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
