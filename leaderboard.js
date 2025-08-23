/* === FILE: leaderboard.js === */
(function(){
  const LS_KEY = 'codeTypeLeaderboardV2';
  function saveLocal(entry){
    const data = JSON.parse(localStorage.getItem(LS_KEY)||'[]');
    data.push(entry); localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
  function loadLocal(){ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }
  async function saveFirebase(entry){ if(!window.USE_FIREBASE||!window.db) return; return window.db.collection('typingLeaderboard').add(entry); }
  async function fetchTopFirebase(filters){ if(!window.USE_FIREBASE||!window.db) return []; let q=window.db.collection('typingLeaderboard'); if(filters.e&&filters.e!=='ALL') q=q.where('event','==',filters.e); if(filters.l&&filters.l!=='ALL') q=q.where('lang','==',filters.l); if(filters.d&&filters.d!=='ALL') q=q.where('diff','==',filters.d); const snap=await q.orderBy('score','desc').limit(100).get(); return snap.docs.map(d=>d.data()); }
  function exportCSV(){ const rows=[["name","score","wpm","acc","time","mistakes","backs","mode","lang","diff","event","ts"]]; const data=loadLocal(); for(const x of data){ rows.push([x.name,x.score,x.wpm,x.acc,x.time,x.mistakes,x.backs,x.mode,x.lang,x.diff,x.event,new Date(x.ts).toISOString()]); } const csv=rows.map(r=>r.join(',')).join('');
const blob=new Blob([csv],{type:'text/csv'}); 
const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='leaderboard.csv'; a.click(); URL.revokeObjectURL(url); }
  function resetLocal(){ if(confirm('Clear local leaderboard?')){ localStorage.removeItem(LS_KEY); if(window.renderLeaderboard) window.renderLeaderboard(); if(window.updateLeaderboardSelectors) window.updateLeaderboardSelectors(); } }
  window.LB = { saveLocal, loadLocal, saveFirebase, fetchTopFirebase, exportCSV, resetLocal, LS_KEY };
})();

const firebaseConfig = {
    apiKey: "AIzaSyBfq7bFSi5NrZMMsaFlQigSHA9cVN76W_c",
    authDomain: "codeday-faed4.firebaseapp.com",
    databaseURL: "https://codeday-faed4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "codeday-faed4",
    storageBucket: "codeday-faed4.firebasestorage.app",
    messagingSenderId: "163027692608",
    appId: "1:163027692608:web:8c17cfdf7a260af41cc3a5",
    measurementId: "G-8JBDLM0L2J"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);