import ProgressTracker from './progress.js';

// Dashboard rendering: Completion donut, Difficulty bar, Recently completed list, Weekly assessments
document.addEventListener('DOMContentLoaded', () => {
  const progressCtx = document.getElementById('progressChart').getContext('2d');
  const difficultyCtx = document.getElementById('difficultyChart').getContext('2d');
  const recentList = document.getElementById('recentlyCompleted');

  // Configurable goal
  const GOAL_KEY = 'solvedGoal';
  let goal = parseInt(localStorage.getItem(GOAL_KEY), 10) || 100;

  // small helper used by dashboard: fetch with timeout then fallback to localStorage
  function fetchWithTimeout(url, opts = {}, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, opts).then(res => {
        clearTimeout(timer);
        resolve(res);
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  async function loadWeeklyHistory() {
    try {
      const resp = await fetchWithTimeout('/api/history', {}, 900);
      if (resp.ok) {
        const data = await resp.json();
        console.debug('dashboard: loaded weekly history from server', data);
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.debug('dashboard: server history not available, falling back to localStorage', e.message || e);
    }
    try {
      const raw = localStorage.getItem('weeklyAssessmentHistory');
      const data = raw ? JSON.parse(raw) : [];
      console.debug('dashboard: loaded weekly history from localStorage', data);
      return data;
    } catch (e) {
      return [];
    }
  }

  async function render() {
    // Stats from tracker
    const stats = ProgressTracker.getCompletionStats();

    // Progress donut: solved vs remaining
    const solved = stats.total;
    const remaining = Math.max(0, goal - solved);

    // create donut
    if (window.progressChart) window.progressChart.destroy();
    window.progressChart = new Chart(progressCtx, {
      type: 'doughnut',
      data: {
        labels: ['Solved', 'Remaining to goal'],
        datasets: [{
          data: [solved, remaining],
          backgroundColor: ['#4caf50', '#e9ecef'],
          borderWidth: 1
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Difficulty bar
    const diffs = ['easy', 'medium', 'hard', 'unknown'];
    const diffCounts = [stats.easy, stats.medium, stats.hard, stats.unknown];
    if (window.difficultyChart) window.difficultyChart.destroy();
    window.difficultyChart = new Chart(difficultyCtx, {
      type: 'bar',
      data: {
        labels: ['Easy', 'Medium', 'Hard', 'Unknown'],
        datasets: [{
          label: 'Solved count',
          data: diffCounts,
          backgroundColor: ['#8bc34a', '#ffc107', '#f44336', '#9ca3af']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });

    // Recently completed list: include problems and weekly assessments
    recentList.innerHTML = '';

    // Problems
    const completed = ProgressTracker.getCompleted().slice().reverse(); // newest first
    const recentProblems = completed.slice(0, 8);
    recentProblems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-start';
      const title = typeof item === 'string' ? item : (item.title || item.link);
      const diff = typeof item === 'string' ? 'unknown' : (item.difficulty || 'unknown');
      const date = typeof item === 'string' ? '' : (new Date(item.date)).toLocaleDateString();
      li.innerHTML = `<div><strong>${title}</strong><div class="text-muted small">${diff.toUpperCase()} ${date ? '• ' + date : ''}</div></div>`;
      recentList.appendChild(li);
    });

    // Weekly assessments (async load)
    const weeklyAll = await loadWeeklyHistory();
    const weekly = (weeklyAll && weeklyAll.length) ? weeklyAll.slice(0,8) : [];
    if (weekly.length) {
      const header = document.createElement('li');
      header.className = 'list-group-item active';
      header.textContent = 'Recent Weekly Assessments';
      recentList.appendChild(header);
      weekly.slice().forEach(h => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start';
        const d = new Date(h.date).toLocaleString();
        li.innerHTML = `<div><strong>Score ${h.score}/${h.total}</strong><div class="text-muted small">${d}</div></div>`;
        recentList.appendChild(li);
      });
    }
  }

  // Render now
  render();

  // Watch for storage changes (in case user saves from assessment page in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'completedProblems' || e.key === 'weeklyAssessmentHistory') render();
  });

  // Also refresh when window gains focus (covers same-tab saves and server-side saves)
  window.addEventListener('focus', () => { render(); });

  // Expose a re-render function for other scripts
  window.dashboardRefresh = render;
});
