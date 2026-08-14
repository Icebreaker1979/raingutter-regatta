(function () {
  'use strict';

  const SAVE_FORMAT = 'raingutter-regatta-mobile';
  const SAVE_VERSION = 1;
  const AUTOSAVE_KEY = 'raingutter-regatta-mobile-autosave-v1';
  const $ = (id) => document.getElementById(id);

  let state = freshState();
  let deferredInstallPrompt = null;

  function freshState() {
    return {
      eventTitle: 'Raingutter Regatta',
      racers: [],
      nextUid: 1,
      engine: null,
      currentMatch: null,
      raceNumber: 1,
      history: [],
      resultLog: [],
      startedAt: null,
      updatedAt: null,
    };
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function displayRacerById(uid) {
    const racer = state.racers.find((item) => item.uid === uid);
    if (!racer) return `Racer ${uid}`;
    const name = (racer.name || '').trim();
    const boat = (racer.boatNumber || '').trim();
    if (boat && name) return `#${boat} — ${name}`;
    if (boat) return `Boat #${boat}`;
    return name || `Racer ${uid}`;
  }

  function racerMeta(uid) {
    const racer = state.racers.find((item) => item.uid === uid);
    if (!racer) return '';
    return racer.rank ? racer.rank : '';
  }

  function normalizeBoat(value) {
    return String(value || '').trim().replace(/^#\s*/, '');
  }

  function safeFilename(value) {
    const cleaned = String(value || 'Raingutter_Regatta')
      .replace(/[^a-z0-9-_]+/gi, '_')
      .replace(/^_+|_+$/g, '');
    return cleaned || 'Raingutter_Regatta';
  }

  function formatDate(value) {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '';
    }
  }

  function addRacer() {
    const boatNumber = normalizeBoat($('boatInput').value);
    const name = $('nameInput').value.trim();
    const rank = $('rankInput').value.trim();

    if (!boatNumber && !name) {
      alert('Enter a racer name, a boat number, or both.');
      return;
    }

    if (boatNumber && state.racers.some((r) => r.boatNumber.toLowerCase() === boatNumber.toLowerCase())) {
      alert(`Boat #${boatNumber} is already entered.`);
      return;
    }

    if (!boatNumber && name) {
      const duplicateNameOnly = state.racers.some(
        (r) => !r.boatNumber && r.name.toLowerCase() === name.toLowerCase(),
      );
      if (duplicateNameOnly) {
        alert('That name-only racer is already entered. Add a boat number to distinguish duplicate names.');
        return;
      }
    }

    state.racers.push({ uid: state.nextUid, boatNumber, name, rank });
    state.nextUid += 1;
    $('boatInput').value = '';
    $('nameInput').value = '';
    $('boatInput').focus();
    renderSetup();
  }

  function removeRacer(uid) {
    state.racers = state.racers.filter((r) => r.uid !== uid);
    renderSetup();
  }

  function renderSetup() {
    state.eventTitle = $('eventTitleInput').value.trim() || 'Raingutter Regatta';
    const list = $('racerList');
    const count = state.racers.length;
    $('racerCount').textContent = `${count} racer${count === 1 ? '' : 's'}`;

    if (!count) {
      list.className = 'racer-list empty-state';
      list.textContent = 'No racers entered yet.';
    } else {
      list.className = 'racer-list';
      list.innerHTML = state.racers.map((r) => {
        const meta = [r.boatNumber ? `Boat #${escapeHtml(r.boatNumber)}` : '', r.rank ? escapeHtml(r.rank) : '']
          .filter(Boolean).join(' • ');
        return `
          <div class="racer-row" data-racer-id="${r.uid}">
            <div>
              <div class="racer-main">${escapeHtml(r.name || (r.boatNumber ? `Boat #${r.boatNumber}` : `Racer ${r.uid}`))}</div>
              <div class="racer-meta">${meta || 'Name only'}</div>
            </div>
            <button class="icon-button remove-racer" type="button" data-racer-id="${r.uid}" aria-label="Remove ${escapeHtml(r.name || `Boat ${r.boatNumber}`)}">Remove</button>
          </div>`;
      }).join('');

      list.querySelectorAll('.remove-racer').forEach((button) => {
        button.addEventListener('click', () => removeRacer(Number(button.dataset.racerId)));
      });
    }

    $('startTournamentButton').disabled = count < 2;
    $('resumeAutosaveButton').classList.toggle('hidden', !hasAutosave());
  }

  function startTournament() {
    state.eventTitle = $('eventTitleInput').value.trim() || 'Raingutter Regatta';
    if (state.racers.length < 2) {
      alert('Enter at least two racers.');
      return;
    }

    state.engine = RegattaEngine.createEngine(state.racers.map((r) => r.uid));
    state.currentMatch = null;
    state.raceNumber = 1;
    state.history = [];
    state.resultLog = [];
    state.startedAt = new Date().toISOString();
    state.updatedAt = state.startedAt;
    advanceToNextMatch();
    showTournament();
    autosave();
    renderAll();
  }

  function advanceToNextMatch() {
    if (!state.engine || state.engine.champion || state.currentMatch) return;
    state.currentMatch = RegattaEngine.getNextMatch(state.engine);
  }

  function undoSnapshot() {
    return {
      engine: RegattaEngine.deepClone(state.engine),
      currentMatch: RegattaEngine.deepClone(state.currentMatch),
      raceNumber: state.raceNumber,
      resultLog: RegattaEngine.deepClone(state.resultLog),
      updatedAt: state.updatedAt,
    };
  }

  function chooseWinner(winnerId) {
    if (!state.currentMatch || !state.engine || state.engine.champion) return;

    state.history.push(undoSnapshot());
    const match = RegattaEngine.deepClone(state.currentMatch);
    const outcome = RegattaEngine.recordWinner(state.engine, match, winnerId);

    state.resultLog.push({
      race: state.raceNumber,
      matchId: match.id,
      bracket: match.bracket,
      round: match.round,
      p1: match.p1,
      p2: match.p2,
      winner: outcome.winnerId,
      loser: outcome.loserId,
      event: outcome.event,
    });

    state.raceNumber += 1;
    state.currentMatch = null;
    advanceToNextMatch();
    state.updatedAt = new Date().toISOString();
    autosave();
    renderAll();
  }

  function undoLastResult() {
    if (!state.history.length) {
      alert('There is no previous race result to undo.');
      return;
    }
    const snapshot = state.history.pop();
    state.engine = snapshot.engine;
    state.currentMatch = snapshot.currentMatch;
    state.raceNumber = snapshot.raceNumber;
    state.resultLog = snapshot.resultLog;
    state.updatedAt = new Date().toISOString();
    autosave();
    renderAll();
  }

  function liveStatus(uid) {
    if (state.engine?.champion === uid) return 'Champion';
    const losses = state.engine?.losses?.[uid] ?? 0;
    if (losses >= 2) return 'Eliminated';
    if (losses === 1) return '1 Loss';
    return 'Undefeated';
  }

  function renderRacerButton(button, uid) {
    if (!uid) {
      button.textContent = 'TBD';
      button.disabled = true;
      return;
    }
    const meta = racerMeta(uid);
    button.disabled = false;
    button.innerHTML = `${escapeHtml(displayRacerById(uid))}${meta ? `<span class="small-line">${escapeHtml(meta)}</span>` : ''}`;
  }

  function renderRaceDay() {
    if (!state.engine) return;
    const champion = state.engine.champion;
    const current = state.currentMatch;

    $('raceNumberLabel').textContent = champion ? 'Tournament Complete' : `Race ${state.raceNumber}`;
    $('bracketLabel').textContent = champion ? 'Champion' : (current?.bracket || 'Tournament Complete');
    $('headerTitle').textContent = state.eventTitle;
    $('saveStatus').textContent = state.updatedAt ? 'Autosaved' : 'Ready';
    $('undoButton').disabled = state.history.length === 0;

    $('championCard').classList.toggle('hidden', !champion);
    $('raceCard').classList.toggle('hidden', Boolean(champion));

    if (champion) {
      const meta = racerMeta(champion);
      $('championCard').innerHTML = `
        <p class="eyebrow">Champion</p>
        <div class="champion-name">${escapeHtml(displayRacerById(champion))}</div>
        ${meta ? `<p class="muted">${escapeHtml(meta)}</p>` : ''}
        <p>Congratulations!</p>`;
      $('onDeckText').textContent = 'Tournament complete';
    } else if (current) {
      renderRacerButton($('racer1Button'), current.p1);
      renderRacerButton($('racer2Button'), current.p2);
      const onDeck = RegattaEngine.peekNextMatch(state.engine);
      $('onDeckText').textContent = onDeck
        ? `${displayRacerById(onDeck.p1)} vs ${displayRacerById(onDeck.p2)} — ${onDeck.bracket}`
        : 'TBD — waiting for race results';
    }

    const standings = state.racers
      .map((r) => ({ ...r, losses: state.engine.losses[r.uid] ?? 0, status: liveStatus(r.uid) }))
      .sort((a, b) => a.losses - b.losses || String(a.boatNumber).localeCompare(String(b.boatNumber), undefined, { numeric: true }) || a.name.localeCompare(b.name));

    $('liveStandings').innerHTML = `<div class="standings-grid">${standings.map((r) => `
      <div class="standing-row">
        <div><strong>${escapeHtml(displayRacerById(r.uid))}</strong>${r.rank ? `<div class="racer-meta">${escapeHtml(r.rank)}</div>` : ''}</div>
        <span class="status-chip">${escapeHtml(r.status)}</span>
      </div>`).join('')}</div>`;
  }

  function bracketBucket(bracket) {
    if (bracket.startsWith("Winner's")) return 'Winner’s Bracket';
    if (bracket.startsWith("Loser's")) return 'Loser’s Bracket';
    return 'Grand Finals';
  }

  function renderMatchNode(item) {
    const winner = item.winner;
    const p1Winner = winner === item.p1;
    const p2Winner = winner === item.p2;
    const stateClass = item.status === 'current' ? ' current' : item.status === 'upcoming' ? ' upcoming' : '';
    const label = item.status === 'upcoming' ? `Upcoming • Round ${item.round}` : `Race ${item.race} • Round ${item.round}`;
    return `
      <article class="match-node${stateClass}">
        <div class="match-title">${escapeHtml(label)}</div>
        <div class="match-racer${p1Winner ? ' winner' : ''}">${escapeHtml(displayRacerById(item.p1))}</div>
        <div class="match-divider"></div>
        <div class="match-racer${p2Winner ? ' winner' : ''}">${escapeHtml(displayRacerById(item.p2))}</div>
        <div class="racer-meta" style="margin-top:8px">${item.status === 'current' ? 'CURRENT RACE' : item.status === 'upcoming' ? 'Scheduled' : 'Completed'}</div>
      </article>`;
  }

  function renderBracket() {
    if (!state.engine) return;
    const items = [];
    state.resultLog.forEach((r) => items.push({ ...r, status: 'complete' }));
    if (state.currentMatch) {
      items.push({ ...state.currentMatch, race: state.raceNumber, status: 'current' });
    }
    let estimate = state.raceNumber + (state.currentMatch ? 1 : 0);
    state.engine.pendingMatches.forEach((m) => {
      items.push({ ...m, race: estimate, status: 'upcoming' });
      estimate += 1;
    });

    const groups = ['Winner’s Bracket', 'Loser’s Bracket', 'Grand Finals'];
    $('bracketView').innerHTML = groups.map((group) => {
      const matches = items.filter((m) => bracketBucket(m.bracket) === group);
      if (!matches.length) {
        return `<section class="bracket-lane"><h3>${group}</h3><p class="muted">No races yet.</p></section>`;
      }
      return `
        <section class="bracket-lane">
          <h3>${group}</h3>
          <div class="bracket-scroller">
            <div class="bracket-track">
              ${matches.map((m, index) => `${renderMatchNode(m)}${index < matches.length - 1 ? '<div class="match-arrow" aria-hidden="true">→</div>' : ''}`).join('')}
            </div>
          </div>
        </section>`;
    }).join('');
  }

  function calculatePlacements() {
    const eliminationOrder = [];
    state.resultLog.forEach((r) => {
      if ((r.event === 'elimination' || r.event === 'champion') && !eliminationOrder.includes(r.loser)) {
        eliminationOrder.push(r.loser);
      }
    });

    const placements = new Map();
    if (state.engine?.champion) {
      placements.set(state.engine.champion, 1);
      const reversed = eliminationOrder.slice().reverse();
      reversed.forEach((uid, index) => {
        if (!placements.has(uid)) placements.set(uid, index + 2);
      });
    }

    return state.racers.map((r) => ({
      ...r,
      place: placements.get(r.uid) || null,
      losses: state.engine?.losses?.[r.uid] ?? 0,
      status: liveStatus(r.uid),
    })).sort((a, b) => {
      if (a.place && b.place) return a.place - b.place;
      if (a.place) return -1;
      if (b.place) return 1;
      return a.losses - b.losses || a.uid - b.uid;
    });
  }

  function renderResults() {
    if (!state.engine) return;
    const complete = Boolean(state.engine.champion);
    const standings = calculatePlacements();
    const championName = state.engine.champion ? displayRacerById(state.engine.champion) : 'Not decided yet';

    $('resultsTitle').textContent = state.eventTitle;
    $('resultsSubtitle').textContent = complete
      ? `Completed ${formatDate(state.updatedAt)}`
      : `Tournament in progress • ${state.resultLog.length} completed race${state.resultLog.length === 1 ? '' : 's'}`;

    $('resultsSummary').innerHTML = `
      <div class="summary-card"><span class="muted">Champion</span><strong>${escapeHtml(championName)}</strong></div>
      <div class="summary-card"><span class="muted">Racers</span><strong>${state.racers.length}</strong></div>
      <div class="summary-card"><span class="muted">Completed Races</span><strong>${state.resultLog.length}</strong></div>`;

    $('resultsStandingsBody').innerHTML = standings.map((r) => `
      <tr>
        <td>${r.place || '—'}</td>
        <td>${r.boatNumber ? `#${escapeHtml(r.boatNumber)}` : '—'}</td>
        <td>${escapeHtml(r.name || displayRacerById(r.uid))}</td>
        <td>${escapeHtml(r.rank || '—')}</td>
        <td>${r.losses}</td>
      </tr>`).join('');

    $('raceLogBody').innerHTML = state.resultLog.length
      ? state.resultLog.map((r) => `
          <tr>
            <td>${r.race}</td>
            <td>${escapeHtml(r.bracket)}</td>
            <td>${escapeHtml(displayRacerById(r.p1))} vs ${escapeHtml(displayRacerById(r.p2))}</td>
            <td>${escapeHtml(displayRacerById(r.winner))}</td>
          </tr>`).join('')
      : '<tr><td colspan="4">No races completed yet.</td></tr>';
  }

  function renderAll() {
    renderRaceDay();
    renderBracket();
    renderResults();
  }

  function showTournament() {
    $('setupView').classList.remove('active');
    $('tournamentView').classList.add('active');
    $('headerTitle').textContent = state.eventTitle;
    activateTab('race');
  }

  function showSetup() {
    $('tournamentView').classList.remove('active');
    $('setupView').classList.add('active');
    $('headerTitle').textContent = 'Raingutter Regatta';
    $('eventTitleInput').value = state.eventTitle || 'Raingutter Regatta';
    renderSetup();
  }

  function activateTab(name) {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
    ['race', 'bracket', 'results'].forEach((tabName) => {
      $(`${tabName}Panel`).classList.toggle('active', tabName === name);
    });
    if (name === 'bracket') renderBracket();
    if (name === 'results') renderResults();
  }

  function exportState() {
    return {
      format: SAVE_FORMAT,
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      tournament: RegattaEngine.deepClone(state),
    };
  }

  function validateLoaded(payload) {
    if (!payload || payload.format !== SAVE_FORMAT || !payload.tournament) {
      throw new Error('This is not a Raingutter Regatta Mobile tournament file.');
    }
    if (Number(payload.version) > SAVE_VERSION) {
      throw new Error('This tournament was saved by a newer version of the app.');
    }
    if (!Array.isArray(payload.tournament.racers)) {
      throw new Error('Tournament racer data is missing.');
    }
    return payload.tournament;
  }

  function importState(tournament) {
    state = Object.assign(freshState(), tournament);
    state.history = Array.isArray(state.history) ? state.history : [];
    state.resultLog = Array.isArray(state.resultLog) ? state.resultLog : [];
    state.racers = Array.isArray(state.racers) ? state.racers : [];
    state.eventTitle = state.eventTitle || 'Raingutter Regatta';
    state.nextUid = state.nextUid || (Math.max(0, ...state.racers.map((r) => r.uid)) + 1);
    state.updatedAt = new Date().toISOString();
    autosave();
    if (state.engine) {
      showTournament();
      renderAll();
    } else {
      $('eventTitleInput').value = state.eventTitle;
      showSetup();
    }
  }

  function autosave() {
    if (!state.engine) return;
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(exportState()));
      $('saveStatus').textContent = 'Autosaved';
    } catch (error) {
      console.warn('Autosave failed', error);
      $('saveStatus').textContent = 'Autosave unavailable';
    }
  }

  function hasAutosave() {
    try {
      return Boolean(localStorage.getItem(AUTOSAVE_KEY));
    } catch {
      return false;
    }
  }

  function resumeAutosave() {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) throw new Error('No autosaved tournament was found.');
      importState(validateLoaded(JSON.parse(raw)));
    } catch (error) {
      alert(error.message || 'Unable to resume the autosaved tournament.');
    }
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function saveTournamentFile() {
    if (!state.engine) return;
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${safeFilename(state.eventTitle)}_${date}.rrt`;
    downloadBlob(filename, JSON.stringify(exportState(), null, 2), 'application/json');
  }

  function loadTournamentFile() {
    $('loadFileInput').value = '';
    $('loadFileInput').click();
  }

  function handleLoadedFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        importState(validateLoaded(payload));
      } catch (error) {
        alert(error.message || 'Unable to load this tournament file.');
      }
    };
    reader.onerror = () => alert('Unable to read the selected file.');
    reader.readAsText(file);
  }

  function newTournament() {
    if (!confirm('Start a new tournament? The current tournament will remain in autosave until the new tournament begins.')) return;
    state = freshState();
    $('eventTitleInput').value = state.eventTitle;
    showSetup();
  }

  function resultsPlainText() {
    const standings = calculatePlacements();
    const lines = [state.eventTitle, '', `Champion: ${state.engine?.champion ? displayRacerById(state.engine.champion) : 'Not decided yet'}`, '', 'Standings:'];
    standings.forEach((r) => {
      lines.push(`${r.place || '—'}. ${displayRacerById(r.uid)}${r.rank ? ` (${r.rank})` : ''} — ${r.losses} loss${r.losses === 1 ? '' : 'es'}`);
    });
    lines.push('', 'Race Log:');
    state.resultLog.forEach((r) => {
      lines.push(`Race ${r.race}: ${displayRacerById(r.winner)} defeated ${displayRacerById(r.loser)} — ${r.bracket}`);
    });
    return lines.join('\n');
  }

  function resultsHtml() {
    const standings = calculatePlacements();
    const rows = standings.map((r) => `<tr><td>${r.place || '—'}</td><td>${r.boatNumber ? `#${escapeHtml(r.boatNumber)}` : '—'}</td><td>${escapeHtml(r.name || displayRacerById(r.uid))}</td><td>${escapeHtml(r.rank || '—')}</td><td>${r.losses}</td></tr>`).join('');
    const races = state.resultLog.map((r) => `<tr><td>${r.race}</td><td>${escapeHtml(r.bracket)}</td><td>${escapeHtml(displayRacerById(r.p1))} vs ${escapeHtml(displayRacerById(r.p2))}</td><td>${escapeHtml(displayRacerById(r.winner))}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(state.eventTitle)} Results</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111}h1{margin-bottom:4px}.muted{color:#555}table{width:100%;border-collapse:collapse;margin:12px 0 28px}th,td{border:1px solid #aaa;padding:8px;text-align:left}th{background:#eee}@media print{body{margin:.4in}}</style></head><body><h1>${escapeHtml(state.eventTitle)}</h1><p class="muted">Tournament Results</p><p><strong>Champion:</strong> ${escapeHtml(state.engine?.champion ? displayRacerById(state.engine.champion) : 'Not decided yet')}</p><h2>Standings</h2><table><thead><tr><th>Place</th><th>Boat</th><th>Racer</th><th>Rank/Den</th><th>Losses</th></tr></thead><tbody>${rows}</tbody></table><h2>Race Log</h2><table><thead><tr><th>Race</th><th>Bracket</th><th>Matchup</th><th>Winner</th></tr></thead><tbody>${races || '<tr><td colspan="4">No completed races.</td></tr>'}</tbody></table></body></html>`;
  }

  async function shareResults() {
    const text = resultsPlainText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${state.eventTitle} Results`, text });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    downloadBlob(`${safeFilename(state.eventTitle)}_results.txt`, text, 'text/plain');
    alert('Your browser does not offer direct sharing here, so a text results file was downloaded instead.');
  }

  function showInstallInstructions() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    let html;
    if (isIOS) {
      html = '<p>In Safari:</p><ol><li>Tap the <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Turn on <strong>Open as Web App</strong> if shown, then tap <strong>Add</strong>.</li></ol>';
    } else if (isAndroid) {
      html = '<p>In Chrome:</p><ol><li>Open the browser menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation.</li></ol>';
    } else {
      html = '<p>Use your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>. On iPhone/iPad, open this page in Safari and use Share → Add to Home Screen.</p>';
    }
    $('installInstructions').innerHTML = html;
    $('installDialog').showModal();
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      $('installButton').classList.add('hidden');
    } else {
      showInstallInstructions();
    }
  }

  function wireEvents() {
    $('addRacerButton').addEventListener('click', addRacer);
    $('boatInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') addRacer(); });
    $('nameInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') addRacer(); });
    $('eventTitleInput').addEventListener('input', () => { state.eventTitle = $('eventTitleInput').value; });
    $('clearRacersButton').addEventListener('click', () => {
      if (state.racers.length && confirm('Remove all entered racers?')) {
        state.racers = [];
        state.nextUid = 1;
        renderSetup();
      }
    });
    $('startTournamentButton').addEventListener('click', startTournament);
    $('resumeAutosaveButton').addEventListener('click', resumeAutosave);
    $('loadSetupButton').addEventListener('click', loadTournamentFile);
    $('racer1Button').addEventListener('click', () => state.currentMatch && chooseWinner(state.currentMatch.p1));
    $('racer2Button').addEventListener('click', () => state.currentMatch && chooseWinner(state.currentMatch.p2));
    $('undoButton').addEventListener('click', undoLastResult);
    $('saveButton').addEventListener('click', saveTournamentFile);
    $('loadButton').addEventListener('click', loadTournamentFile);
    $('newTournamentButton').addEventListener('click', newTournament);
    $('printButton').addEventListener('click', () => window.print());
    $('shareButton').addEventListener('click', shareResults);
    $('downloadResultsButton').addEventListener('click', () => {
      downloadBlob(`${safeFilename(state.eventTitle)}_results.html`, resultsHtml(), 'text/html');
    });
    $('loadFileInput').addEventListener('change', () => handleLoadedFile($('loadFileInput').files[0]));
    $('installButton').addEventListener('click', installApp);

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });

    document.addEventListener('keydown', (event) => {
      if (!$('tournamentView').classList.contains('active')) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === '1' && state.currentMatch) chooseWinner(state.currentMatch.p1);
      if (event.key === '2' && state.currentMatch) chooseWinner(state.currentMatch.p2);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undoLastResult();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveTournamentFile();
      }
    });
  }

  function setupPwa() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      $('installButton').classList.remove('hidden');
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      $('installButton').classList.add('hidden');
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isStandalone) $('installButton').classList.remove('hidden');

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(() => { $('offlineStatus').textContent = 'Offline-ready'; })
        .catch(() => { $('offlineStatus').textContent = 'Online mode'; });
    } else if (location.protocol === 'file:') {
      $('offlineStatus').textContent = 'Local preview — host over HTTPS to install';
    }
  }

  wireEvents();
  setupPwa();
  $('eventTitleInput').value = state.eventTitle;
  renderSetup();
})();
