const STORAGE_KEY = 'completedProblems';

const ProgressTracker = {
  // Accept either a string (link) or an object { id?, title, link, difficulty: 'easy'|'medium'|'hard', date }
  markCompleted(item) {
    const completed = this.getCompleted();
    // normalize
    const normalized = typeof item === 'string' ? { link: item, title: item, difficulty: 'unknown', date: new Date().toISOString() } : Object.assign({ date: new Date().toISOString(), difficulty: 'unknown' }, item);

    // avoid duplicates by link
    const exists = completed.find(c => (typeof c === 'string' ? c === normalized.link : c.link === normalized.link));
    if (!exists) {
      completed.push(normalized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  },

  unmarkCompleted(link) {
    const completed = this.getCompleted();
    const idx = completed.findIndex(c => (typeof c === 'string' ? c === link : c.link === link));
    if (idx > -1) {
      completed.splice(idx, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  },

  getCompleted() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (e) {
      return [];
    }
  },

  isCompleted(link) {
    return this.getCompleted().some(c => (typeof c === 'string' ? c === link : c.link === link));
  },

  // Returns counts by difficulty and total
  getCompletionStats() {
    const completed = this.getCompleted();
    const stats = { total: 0, easy: 0, medium: 0, hard: 0, unknown: 0 };
    completed.forEach(c => {
      stats.total += 1;
      const diff = typeof c === 'string' ? 'unknown' : (c.difficulty || 'unknown');
      if (diff === 'easy') stats.easy += 1;
      else if (diff === 'medium') stats.medium += 1;
      else if (diff === 'hard') stats.hard += 1;
      else stats.unknown += 1;
    });
    return stats;
  }
};

export default ProgressTracker;