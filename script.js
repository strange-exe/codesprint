(function(){
  const $ = s=>document.querySelector(s);
  const fmtTime = s => `${s.toFixed(2)}s`;
  const now = ()=>performance.now();
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

  let state = {
    round: 0, totalRounds: 5, currentSnippet: '',
    startedAt: 0, elapsed: 0, mistakes: 0, backs: 0,
    typed: '', wpm: 0, accuracy: 100, score: 0,
    mode: 'competition', language: 'python', difficulty: 'medium',
    name: '', event: '', penalties: 0, roundsData: [], running: false,
    survivalLives: 3
  };

  const inputArea = $('#inputArea');
  const snippetEl = $('#snippet');

  function toast(msg){
    const t=document.createElement('div');
    t.textContent=msg;
    Object.assign(t.style,{position:'fixed',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'#101826',border:'1px solid #263248',padding:'8px 12px',borderRadius:'10px',color:'#d6e6f7',zIndex:99});
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),1600);
  }

  inputArea.addEventListener('paste',e=>{e.preventDefault(); toast('Pasting disabled');});
  inputArea.addEventListener('drop',e=>{e.preventDefault();});
  inputArea.addEventListener('contextmenu',e=>e.preventDefault());

  inputArea.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = inputArea.selectionStart, end = inputArea.selectionEnd;
      const v = inputArea.value, insert = '    ';
      inputArea.value = v.slice(0, start) + insert + v.slice(end);
      inputArea.selectionStart = inputArea.selectionEnd = start + insert.length;
      onInput();
    } else if (e.key === 'Enter') {
      const val = inputArea.value;
      const start = inputArea.selectionStart;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const line = val.slice(lineStart, start);
      const indentMatch = line.match(/^[ \t]*/);
      let indent = indentMatch ? indentMatch[0] : '';
      if (state.language === 'python' && line.trim().endsWith(':')) indent += '    ';
      e.preventDefault();
      const insert = '\n' + indent;
      inputArea.value = val.slice(0, start) + insert + val.slice(start);
      inputArea.selectionStart = inputArea.selectionEnd = start + insert.length;
      onInput();
    }
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden && state.running){
      state.penalties += 1.5;
      updateHUD();
      toast('Tab switch penalty +1.5s');
    }
  });

  function runCountdown(cb){
    const overlay=$('#countdown'); const num=$('#countNum');
    overlay.style.display='flex'; let c=3; num.textContent=c;
    const id=setInterval(()=>{
      c--;
      if(c>0){ num.textContent=c; }
      else { clearInterval(id); overlay.style.display='none'; cb(); }
    },700);
  }

  function startGame(){
    state = {...state, round:0, roundsData:[], penalties:0, mistakes:0, backs:0, score:0, typed:'', elapsed:0, running:false, survivalLives:3};
    state.name = $('#playerName').value.trim()||'Player';
    state.mode = $('#mode').value;
    state.language = $('#language').value;
    state.difficulty = $('#difficulty').value;
    state.event = $('#eventCode').value.trim()||'DEFAULT';
    state.totalRounds = state.mode==='competition'?5: (state.mode==='practice'?1:999);
    $('#postGame').classList.add('hidden');
    $('#startBtn').style.display = 'none';
    $('#stopBtn').style.display = '';
    nextRound();
  }

  function nextRound(){
    if(state.mode==='survival' && state.survivalLives<=0) return endGame();
    if(state.round >= state.totalRounds && state.mode!=='survival') return endGame();
    state.round++;
    $('#roundLabel').textContent = `${state.round}/${state.mode==='survival'? '∞': state.totalRounds}`;

    state.currentSnippet = pickSnippet(state.language,state.difficulty);
    state.typed=''; state.mistakes=0; state.backs=0; state.elapsed=0; state.wpm=0; state.accuracy=100; state.running=false;
    renderSnippet(); inputArea.value=''; inputArea.disabled=true; updateFilename();
    runCountdown(()=>{ inputArea.disabled=false; inputArea.focus(); startTimer(); });
  }

  async function endGame(){
    inputArea.disabled=true; state.running=false;
    const totals = aggregateTotals();
    const sum = totals.totalTime + state.penalties;
    const finalScore = computeScore(totals.charsTyped, sum, totals.mistakes, totals.backs, state.difficulty);
    state.score = finalScore;

    $('#resultSummary').textContent =
      `${state.name} — Score ${finalScore.toFixed(1)} • WPM ${totals.wpm.toFixed(0)} • Acc ${totals.accuracy.toFixed(0)}% • Time ${sum.toFixed(2)}s`;
    $('#resultBreakdown').textContent =
      `Rounds: ${state.roundsData.length} | Raw Time: ${totals.totalTime.toFixed(2)}s | Penalties: ${state.penalties.toFixed(1)}s | Mistakes: ${totals.mistakes} | Backspaces: ${totals.backs}`;
    $('#postGame').classList.remove('hidden');

    await saveScore();

    updateLeaderboardSelectors();
    renderLeaderboard();
  }

  function startTimer(){ state.startedAt = now(); state.running=true; requestAnimationFrame(tick); }
  function tick(){ if(!state.running) return; state.elapsed = (now()-state.startedAt)/1000; updateHUD(); requestAnimationFrame(tick); }

  function onInput(){
    if(!state.running) return;
    const target = state.currentSnippet; const typed = inputArea.value;
    if(typed.length < state.typed.length) state.backs++;
    state.typed = typed;

    let correctLen = 0; let mistakes = 0;
    for(let i=0;i<typed.length;i++){
      const tCh = target[i]; const uCh = typed[i];
      if(tCh === uCh) correctLen++;
      else if(tCh===' ' || tCh==='\n' || tCh==='\t'){ /* neutral */ }
      else mistakes++;
    }
    state.mistakes = mistakes;

    const chars = typed.length; const minutes = Math.max(state.elapsed,0.01)/60;
    const wpm = (chars/5)/minutes;
    const acc = chars? (correctLen/chars)*100 : 100;
    state.wpm = wpm; state.accuracy = acc;

    if(typed===target){
      state.running=false;
      const roundTime = state.elapsed;
      const record = {round:state.round, time:roundTime, mistakes:mistakes, backs:state.backs, chars:target.length};
      state.roundsData.push(record);
      if(state.mode==='survival'){ if(acc<85 || mistakes>Math.ceil(target.length*0.08)) state.survivalLives--; }
      nextRound();
    }

    renderSnippet();
    updateHUD();
  }

  function updateHUD(){
    $('#timer').textContent = fmtTime(state.elapsed + state.penalties);
    $('#wpm').textContent = state.wpm.toFixed(0);
    $('#accuracy').textContent = `${state.accuracy.toFixed(0)}%`;
    $('#mistakes').textContent = state.mistakes;
    $('#backs').textContent = state.backs;
    const totals = aggregateTotals();
    const tempScore = computeScore(totals.charsTyped, totals.totalTime + state.penalties, totals.mistakes, totals.backs, state.difficulty);
    $('#score').textContent = tempScore.toFixed(1);
  }

  function computeScore(chars, timeSec, mistakes, backs, diff){
    const wpm = chars/5 / Math.max(timeSec/60, 0.01);
    const accuracy = chars? (Math.max(chars - mistakes, 0)/chars) : 1;
    const base = wpm * (accuracy);
    const penalty = mistakes*2 + backs*0.5;
    const diffBonus = diff==='hard'? 10 : diff==='medium'? 5 : 0;
    return clamp(base*10 - penalty + diffBonus, 0, 9999);
  }

  function aggregateTotals(){
    let totalTime=0, mistakes=0, backs=0, chars=0;
    for(const r of state.roundsData){ totalTime+=r.time; mistakes+=r.mistakes; backs+=r.backs; chars+=r.chars; }
    if(state.running){ totalTime += state.elapsed; mistakes += state.mistakes; backs += state.backs; chars += state.currentSnippet.length; }
    const minutes = Math.max(totalTime/60,0.01); const wpm = chars/5/minutes; const accuracy = chars? (Math.max(chars-mistakes,0)/chars)*100 : 100;
    return {totalTime, mistakes, backs, charsTyped:chars, wpm, accuracy};
  }

  function pickSnippet(lang, diff){
    const arr = (window.SNIPPETS?.[lang]?.[diff]||['// No snippets']);
    return arr[Math.floor(Math.random()*arr.length)];
  }

  function updateFilename(){
    const map={python:'snippet.py', javascript:'snippet.js', c:'snippet.c'};
    $('#filename').textContent = map[state.language]||'snippet.txt';
    snippetEl.className = `language-${state.language==='javascript'?'javascript':state.language}`;
  }

  function renderSnippet(){
    const t = state.currentSnippet, typed = state.typed; let html='';
    for(let i=0;i<t.length;i++){
      const ch = t[i];
      if(i < typed.length){
        if(typed[i]===ch) html += `<span class="typed">${escapeHtml(ch)}</span>`;
        else if(ch===' '||ch==='\n'||ch==='\t') html += `<span class="target">${escapeHtml(ch)}</span>`; // neutral whitespace
        else html += `<span class="error">${escapeHtml(ch)}</span>`;
      } else {
        html += `<span class="target">${escapeHtml(ch)}</span>`;
      }
    }
    snippetEl.innerHTML = html || '<span style="color:#9fb3c8">…</span>';
    if(window.Prism) Prism.highlightElement(snippetEl);
  }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  }

  function getFilters(){
    const e=$('#lbEvent').value||'ALL';
    const l=$('#lbLang').value||'ALL';
    const d=$('#lbDiff').value||'ALL';
    return {e,l,d};
  }

  let fbUnsub = null;

  function renderLeaderboard(){
    const {e,l,d} = getFilters();

    const local = LB.loadLocal();
    let all = [...local];

    function renderTable(entries){
      const filtered = entries.filter(x =>
        (e==='ALL'||x.event===e) &&
        (l==='ALL'||x.lang===l) &&
        (d==='ALL'||x.diff===d)
      );
      filtered.sort((a,b)=> b.score - a.score || a.time - b.time || (a.ts - b.ts));
      const tbody = $('#lbBody'); tbody.innerHTML='';
      filtered.slice(0,100).forEach((x,i)=>{
        const tr=document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(x.name)}</td><td>${x.score.toFixed(1)}</td><td>${x.wpm}</td><td>${x.acc}%</td><td>${x.time.toFixed(2)}s</td><td>${x.mode}</td><td>${new Date(x.ts).toLocaleString()}</td>`;
        tbody.appendChild(tr);
      });
    }

    renderTable(all);

    if (fbUnsub) { try { fbUnsub(); } catch(_){} fbUnsub = null; }
    if (window.USE_FIREBASE && typeof LB.listenFirebase === 'function') {
      fbUnsub = LB.listenFirebase({e,l,d}, remote => {
        all = [...local, ...remote];
        renderTable(all);
      });
    }
  }

  function updateLeaderboardSelectors(){
    const data = LB.loadLocal();
    const events = ['ALL', ...new Set(data.map(x=>x.event))];
    const langs = ['ALL','python','javascript','c'];
    const diffs = ['ALL','easy','medium','hard'];
    $('#lbEvent').innerHTML = events.map(x=>`<option>${x}</option>`).join('');
    $('#lbLang').innerHTML = langs.map(x=>`<option ${x==='python'? 'selected':''}>${x}</option>`).join('');
    $('#lbDiff').innerHTML = diffs.map(x=>`<option ${x==='medium'? 'selected':''}>${x}</option>`).join('');
  }

  async function saveScore(){
    const totals = aggregateTotals();
    const entry = {
      name: state.name,
      score: Number(state.score.toFixed(1)),
      wpm: Number(totals.wpm.toFixed(0)),
      acc: Number(totals.accuracy.toFixed(0)),
      time: Number((totals.totalTime + state.penalties).toFixed(2)),
      mistakes: totals.mistakes,
      backs: totals.backs,
      mode: state.mode,
      lang: state.language,
      diff: state.difficulty,
      event: state.event,
      ts: Date.now()
    };
    LB.saveLocal(entry);
    if(window.USE_FIREBASE){
      try { await LB.saveFirebase(entry); }
      catch(e){ console.error(e); toast('Online save failed, saved locally.'); }
    }
    renderLeaderboard();
    toast('Saved!');
  }

  window.renderLeaderboard = renderLeaderboard;
  window.updateLeaderboardSelectors = updateLeaderboardSelectors;

  $('#startBtn').addEventListener('click', startGame);
  $('#playAgainBtn').addEventListener('click', startGame);
  $('#saveScoreBtn').addEventListener('click', saveScore);
  $('#exportCsvBtn').addEventListener('click', LB.exportCSV);
  $('#resetBtn').addEventListener('click', LB.resetLocal);
  $('#lbEvent').addEventListener('change', renderLeaderboard);
  $('#lbLang').addEventListener('change', renderLeaderboard);
  $('#lbDiff').addEventListener('change', renderLeaderboard);
  inputArea.addEventListener('input', onInput);

  document.addEventListener('keydown',e=>{
    if(e.key==='Enter' && e.ctrlKey){ if(!state.running) startGame(); }
  });

  updateLeaderboardSelectors();
  renderLeaderboard();

  $('#howToBtn').addEventListener('click',e=>{
    e.preventDefault();
    alert(`How it works:

1) Choose mode, language, difficulty, and set an Event Code.
2) Press Start, wait for the 3..2..1 countdown, then type the snippet exactly.
3) Competition mode runs 5 rounds.
4) Score = scaled WPM × Accuracy − Penalties + Difficulty bonus.
5) Results auto-save. Use Event Code to group your contest.

Anti-cheat: Pasting is disabled. Tab switching adds a time penalty. Tab inserts 4 spaces. Spaces aren't marked as mistakes.`);
  });

  $('#stopBtn').addEventListener('click', () => {
    state.running = false;
    inputArea.disabled = true;
    $('#startBtn').style.display = '';
    $('#stopBtn').style.display = 'none';
    toast('Stopped!');
  });
})();
