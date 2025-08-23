/* === FILE: leaderboard.js === */
(function () {
  const LS_KEY = 'codeTypeLeaderboardV2';

  // ---------- Local storage ----------
  function saveLocal(entry) {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    data.push(entry);
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
  function loadLocal() {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  }
  function exportCSV() {
    const rows = [
      ["name","score","wpm","acc","time","mistakes","backs","mode","lang","diff","event","ts"]
    ];
    const data = loadLocal();
    for (const x of data) {
      rows.push([
        x.name, x.score, x.wpm, x.acc, x.time, x.mistakes, x.backs,
        x.mode, x.lang, x.diff, x.event, new Date(x.ts).toISOString()
      ]);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leaderboard.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  function resetLocal() {
    if (confirm('Clear local leaderboard?')) {
      localStorage.removeItem(LS_KEY);
      if (window.renderLeaderboard) window.renderLeaderboard();
      if (window.updateLeaderboardSelectors) window.updateLeaderboardSelectors();
    }
  }

  // ---------- Firebase (compat) ----------
  // Expect window.USE_FIREBASE + window.FIREBASE_CONFIG to be set in index.html
  if (window.USE_FIREBASE && window.FIREBASE_CONFIG && typeof firebase !== 'undefined') {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      window.db = firebase.firestore(); // expose globally for other modules
    } catch (e) {
      console.warn('Firebase init failed', e);
    }
  }

  // Collection name (keep consistent everywhere)
  const COLLECTION = 'typingLeaderboard';

  async function saveFirebase(entry) {
    if (!window.db) return;
    return window.db.collection(COLLECTION).add(entry);
  }

  // Live listener (returns unsubscribe fn)
  function listenFirebase(filters, cb) {
    if (!window.db) return () => {};
    let q = window.db.collection(COLLECTION);

    if (filters?.e && filters.e !== 'ALL') q = q.where('event', '==', filters.e);
    if (filters?.l && filters.l !== 'ALL') q = q.where('lang', '==', filters.l);
    if (filters?.d && filters.d !== 'ALL') q = q.where('diff', '==', filters.d);

    q = q.orderBy('score', 'desc').limit(100);

    const unsub = q.onSnapshot(snap => {
      const results = snap.docs.map(d => d.data());
      cb(results);
    }, err => console.warn('FB listen error', err));

    return unsub;
  }

  window.LB = {
    saveLocal, loadLocal, exportCSV, resetLocal,
    saveFirebase, listenFirebase, LS_KEY
  };
})();
