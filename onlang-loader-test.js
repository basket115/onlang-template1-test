// ============================================================
// ONLANG Loader – Version 3.2
// Zentrale Datei für ALLE Templates
// NEU 3.2: Spielplan-Widget + Social Media Auto-Post
// ============================================================

const ONLANG_API = 'https://script.google.com/macros/s/AKfycbx7gnTorNAQz21x3vwZOFQl2bkP2t1QKLppcUSQ_-CQywRS-36AZOeqDDMJg3uXVa2ntA/exec';

// ── Schriftarten-Map ─────────────────────────────────────────
const ONLANG_SCHRIFTEN = {
  'Barlow Condensed': { google: 'Barlow+Condensed:wght@700,900', css: "'Barlow Condensed', sans-serif" },
  'Oswald':           { google: 'Oswald:wght@600,700',           css: "'Oswald', sans-serif" },
  'Montserrat':       { google: 'Montserrat:wght@700,800',       css: "'Montserrat', sans-serif" },
  'Playfair Display': { google: 'Playfair+Display:wght@700',     css: "'Playfair Display', serif" },
  'DM Serif Display': { google: 'DM+Serif+Display',              css: "'DM Serif Display', serif" },
  'Nunito':           { google: 'Nunito:wght@700,800',           css: "'Nunito', sans-serif" }
};

function getKundenId() {
  return new URLSearchParams(window.location.search).get('kunde') ||
         new URLSearchParams(window.location.search).get('id') || '';
}

async function apiFetch(action, kundenId, extraParams) {
  try {
    let url = ONLANG_API + '?action=' + action + '&kundenId=' + kundenId;
    if (extraParams) url += '&' + extraParams;
    const res = await fetch(url);
    return await res.json();
  } catch(e) { console.error('ONLANG API Fehler [' + action + ']:', e); return null; }
}

function formatiereDatum(val) {
  if (!val) return '';
  if (typeof val === 'string' && !val.includes('T') && !val.includes('-')) return val;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const tage = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    const tag = tage[d.getDay()];
    const datum = String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.';
    const h = d.getHours(), m = d.getMinutes();
    const zeit = (h === 0 && m === 0) ? '' : ' ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ' Uhr';
    return tag + ', ' + datum + zeit;
  } catch(e) { return val; }
}

function youtubeEmbed(url) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? 'https://www.youtube.com/embed/' + match[1] : '';
}

function mediaBild(b, hoehe, breite) {
  breite = breite || '100%';
  if (b.Bild_URL) return '<img src="' + b.Bild_URL + '" alt="' + (b.Titel||'') + '" style="width:' + breite + ';height:' + hoehe + 'px;object-fit:cover;display:block;">';
  if (b.Video_URL) {
    const embed = youtubeEmbed(b.Video_URL);
    if (embed && breite === '100%') return '<iframe src="' + embed + '" style="width:100%;height:' + hoehe + 'px;border:none;display:block;" allowfullscreen></iframe>';
    return '<div style="width:' + breite + ';height:' + hoehe + 'px;background:#0D1B2A;display:flex;align-items:center;justify-content:center;font-size:' + (hoehe>150?'3rem':'1.5rem') + ';">▶️</div>';
  }
  return '<div style="width:' + breite + ';height:' + hoehe + 'px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:' + (hoehe>150?'3rem':'1.5rem') + ';">📰</div>';
}

// ── SCHRIFTART ───────────────────────────────────────────────
function wendeSchrift(schriftName) {
  if (!schriftName || !ONLANG_SCHRIFTEN[schriftName]) return;
  const schrift = ONLANG_SCHRIFTEN[schriftName];
  const fontId = 'onlang-font-' + schriftName.replace(/\s/g, '-');
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + schrift.google + '&display=swap';
    document.head.appendChild(link);
  }
  document.documentElement.style.setProperty('--font-heading', schrift.css);
  ['h1','h2','.section-title','.hero h1','.verein-name','.section-tag','.team-name-h','.detail-card-header','.nav-logo span'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => { el.style.fontFamily = schrift.css; });
  });
}

// ── BRANDING ─────────────────────────────────────────────────
function wendeBranding(b) {
  if (!b) return;
  const root = document.documentElement;
  if (b.Thema_Farbe)  { root.style.setProperty('--primary', b.Thema_Farbe); root.style.setProperty('--primary-dark', b.Thema_Farbe); root.style.setProperty('--primary-light', b.Thema_Farbe); }
  if (b.Akzent_Farbe) root.style.setProperty('--accent', b.Akzent_Farbe);
  if (b.Verein_Name)  { document.querySelectorAll('.verein-name').forEach(el => el.textContent = b.Verein_Name); document.title = b.Verein_Name + ' – Offizielle Website'; }
  if (b.Logo_Verein)  { document.querySelectorAll('.verein-logo, .nav-logo img').forEach(el => { el.src = b.Logo_Verein; el.style.display='block'; el.onerror=null; }); }
}

// ── WEBSITE SETTINGS ─────────────────────────────────────────
function wendeSettings(s) {
  if (!s) return;
  const set = (cls, val) => { if (!val) return; document.querySelectorAll(cls).forEach(el => el.textContent = val); };
  set('.verein-name',             s.Hero_Titel);
  set('.verein-slogan',           s.Hero_Unterzeile);
  set('.verein-mitglieder',       s.Mitglieder_Anzahl);
  set('.verein-jahr',             s.Gruendungsjahr);
  set('.verein-trainer-anzahl',   s.Trainer_Anzahl);
  set('.verein-naechstes-spiel',  s.Naechstes_Spiel);
  set('.verein-letztes-ergebnis', s.Letztes_Ergebnis);
  set('.verein-halle',            s.Halle_Name);
  set('.verein-adresse',          s.Halle_Adresse);
  if (s.Naechstes_Datum) document.querySelectorAll('.verein-naechstes-datum').forEach(el => el.textContent = '📅 ' + formatiereDatum(s.Naechstes_Datum));
  if (s.Email)   { document.querySelectorAll('.verein-email').forEach(el => { el.textContent = s.Email; el.href = 'mailto:' + s.Email; }); }
  if (s.Telefon) { document.querySelectorAll('.verein-telefon').forEach(el => { el.textContent = s.Telefon; el.href = 'tel:' + s.Telefon; }); }
  if (s.Willkommenstext) {
    const box = document.getElementById('willkommen-box');
    if (box) {
      const t = box.querySelector('.willkommen-titel'); if (t && s.Hero_Titel) t.textContent = 'Willkommen bei ' + s.Hero_Titel + '!';
      const x = box.querySelector('.willkommen-text'); if (x) x.textContent = s.Willkommenstext;
      box.style.display = 'block';
    }
  }
  if (s.Verein_Name) { document.title = s.Verein_Name + ' – Offizielle Website'; }
  const root = document.documentElement;
  if (s.Thema_Farbe)  { root.style.setProperty('--primary', s.Thema_Farbe); root.style.setProperty('--primary-dark', s.Thema_Farbe); root.style.setProperty('--primary-light', s.Thema_Farbe); }
  if (s.Akzent_Farbe) root.style.setProperty('--accent', s.Akzent_Farbe);
  if (s.Nav_Farbe)    root.style.setProperty('--nav', s.Nav_Farbe);
  if (s.Hintergrund_Farbe) { root.style.setProperty('--bg', s.Hintergrund_Farbe); root.style.setProperty('--bg-body', s.Hintergrund_Farbe); document.body.style.background = s.Hintergrund_Farbe; }
  if (s.Text_Farbe)   { root.style.setProperty('--text', s.Text_Farbe); root.style.setProperty('--text-color', s.Text_Farbe); document.body.style.color = s.Text_Farbe; }
  if (s.Schrift_Familie) wendeSchrift(s.Schrift_Familie);
}

// ── TEAMS ────────────────────────────────────────────────────
function wendeTeams(teams) {
  if (!teams || !teams.length) return;
  window._onlangTeams = teams;
  document.querySelectorAll('#teams-anzahl').forEach(el => el.textContent = teams.length);
  const sidebar = document.getElementById('sidebar-teams');
  if (sidebar) {
    sidebar.innerHTML = teams.map(t =>
      '<a class="team-list-item" onclick="onlangZeigeTeam(\'' + t.Team_ID + '\')" style="cursor:pointer;">' +
      '<span class="team-list-icon">👥</span>' +
      '<div class="team-list-info"><div class="team-list-name">' + (t.Team_Name||'') + '</div><div class="team-list-liga">' + (t.Liga||'') + '</div></div>' +
      '<span class="team-list-arrow">›</span></a>'
    ).join('');
  }
  const grid = document.getElementById('teams-grid');
  if (grid) {
    grid.innerHTML = teams.map(t =>
      '<div class="team-card" onclick="onlangZeigeTeam(\'' + t.Team_ID + '\')" style="cursor:pointer;">' +
      '<div class="team-icon">👥</div><div class="team-name">' + (t.Team_Name||'') + '</div><div class="team-liga">' + (t.Liga||'') + '</div></div>'
    ).join('');
  }
}

function onlangZeigeTeam(teamId) {
  const teams = window._onlangTeams || [];
  const team = teams.find(t => t.Team_ID === teamId);
  if (!team) return;
  const hauptseite = document.getElementById('hauptseite');
  const detailseite = document.getElementById('team-detail');
  if (!detailseite) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '–'; };
  set('td-name', team.Team_Name); set('td-liga', team.Liga); set('td-trainer', team.Trainer);
  set('td-halle', team.Halle); set('td-halle-name', team.Halle); set('td-halle-adresse', team.Halle_Adresse);
  set('td-training-kurz', (team.Training||[]).join(' · '));
  const fotoWrap = document.getElementById('td-foto-wrap');
  if (fotoWrap) fotoWrap.innerHTML = team.Team_Foto ? '<img src="' + team.Team_Foto + '" alt="' + team.Team_Name + '" class="team-foto">' : '<div class="team-foto-ph">👥</div>';
  const spieler = Array.isArray(team.Spieler) ? team.Spieler : [];
  set('td-spieler-anzahl', spieler.length + ' Spieler');
  const sl = document.getElementById('td-spieler-liste');
  if (sl) sl.innerHTML = spieler.length ? spieler.map((s,i) => '<li class="spieler-item"><div class="spieler-num">' + (i+1) + '</div><span class="spieler-name">' + s + '</span></li>').join('') : '<li class="spieler-item" style="color:#999">Keine Spieler eingetragen</li>';
  const training = Array.isArray(team.Training) ? team.Training : [];
  const te = document.getElementById('td-trainingszeiten');
  if (te) te.innerHTML = training.length ? training.map(t => '<div class="training-item"><span class="training-icon">⏰</span><div class="training-info"><div class="t-tag">Training</div><div class="t-val">' + t + '</div></div></div>').join('') : '<p style="color:#999;font-size:0.85rem;">Keine Trainingszeiten eingetragen</p>';
  if (hauptseite) hauptseite.style.display = 'none';
  detailseite.style.display = 'block';
  window.scrollTo(0, 0);
}

function onlangZeigeHauptseite() {
  const h = document.getElementById('hauptseite');
  const d = document.getElementById('team-detail');
  if (h) h.style.display = 'block';
  if (d) d.style.display = 'none';
  window.scrollTo(0, 0);
}

// ── MODAL ────────────────────────────────────────────────────
function onlangInjectModal() {
  if (document.getElementById('onlang-modal')) return;
  document.head.insertAdjacentHTML('beforeend', '<style id="onlang-modal-css">.onlang-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9000;align-items:center;justify-content:center;padding:1rem;}.onlang-modal-overlay.open{display:flex;}.onlang-modal-box{background:white;border-radius:16px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.3);animation:onlangIn 0.25s ease;position:relative;}@keyframes onlangIn{from{transform:scale(0.95);opacity:0;}to{transform:scale(1);opacity:1;}}.onlang-modal-close-top{position:absolute;top:.75rem;right:.75rem;z-index:10;background:rgba(0,0,0,.5);color:white;border:none;width:36px;height:36px;border-radius:50%;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}.onlang-modal-media{border-radius:16px 16px 0 0;overflow:hidden;}.onlang-modal-body{padding:1.5rem;}.onlang-modal-tag{display:inline-block;background:var(--primary,#CC0000);color:white;font-size:.68rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:.2rem .6rem;border-radius:3px;margin-bottom:.75rem;}.onlang-modal-title{font-size:1.4rem;font-weight:800;color:#1A1A1A;margin-bottom:.5rem;line-height:1.3;}.onlang-modal-meta{font-size:.78rem;color:#888;margin-bottom:1rem;}.onlang-modal-text{font-size:.95rem;color:#333;line-height:1.8;white-space:pre-wrap;}.onlang-modal-close-btn{display:block;margin:1.5rem auto 0;background:var(--primary,#CC0000);color:white;border:none;padding:.75rem 2.5rem;border-radius:100px;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;}</style>');
  document.body.insertAdjacentHTML('beforeend',
    '<div class="onlang-modal-overlay" id="onlang-modal" onclick="if(event.target===this){onlangSchliesseModal();}">' +
    '<div class="onlang-modal-box">' +
    '<button class="onlang-modal-close-top" onclick="onlangSchliesseModal()">✕</button>' +
    '<div class="onlang-modal-media" id="onlang-modal-media"></div>' +
    '<div class="onlang-modal-body">' +
    '<div class="onlang-modal-tag" id="onlang-modal-tag">News</div>' +
    '<div class="onlang-modal-title" id="onlang-modal-titel"></div>' +
    '<div class="onlang-modal-meta" id="onlang-modal-meta"></div>' +
    '<div class="onlang-modal-text" id="onlang-modal-text"></div>' +
    '<button class="onlang-modal-close-btn" onclick="onlangSchliesseModal()">✕ Schließen</button>' +
    '</div></div></div>');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') onlangSchliesseModal(); });
}

function onlangOeffneModal(b) {
  const embed = youtubeEmbed(b.Video_URL || '');
  let media = '';
  if (b.Bild_URL) media = '<img src="' + b.Bild_URL + '" style="width:100%;height:auto;max-height:70vh;object-fit:contain;display:block;background:#f2f2f2;">';
  else if (embed) media = '<iframe src="' + embed + '" style="width:100%;height:260px;border:none;display:block;" allowfullscreen></iframe>';
  else if (b.Video_URL) media = '<div style="width:100%;height:180px;background:#0D1B2A;display:flex;align-items:center;justify-content:center;font-size:4rem;">▶️</div>';
  document.getElementById('onlang-modal-media').innerHTML = media;
  document.getElementById('onlang-modal-tag').textContent = b.Kategorie || 'News';
  document.getElementById('onlang-modal-titel').textContent = b.Titel || '';
  document.getElementById('onlang-modal-meta').textContent = '📅 ' + (b.Datum || b.date || '');
  document.getElementById('onlang-modal-text').textContent = b.Text || '';
  document.getElementById('onlang-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function onlangSchliesseModal() {
  const m = document.getElementById('onlang-modal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

// ── NEWS ─────────────────────────────────────────────────────
function wendeNews(beitraege) {
  if (!beitraege || !beitraege.length) return;
  const ticker = document.getElementById('ticker-text');
  if (ticker && beitraege[0]) ticker.textContent = '⚡ Neu: ' + beitraege[0].Titel;
  const count = document.getElementById('news-count');
  if (count) count.textContent = beitraege.length + ' Beiträge';
  const grid = document.getElementById('news-grid');
  if (grid) grid.innerHTML = beitraege.slice(0,6).map(b =>
    '<div class="news-card" onclick=\'onlangOeffneModal(' + JSON.stringify(b) + ')\' style="cursor:pointer;">' +
    mediaBild(b,180) +
    '<div class="news-card-body"><div class="news-tag">' + (b.Kategorie||'News') + '</div><h3>' + (b.Titel||'') + '</h3><p>' + (b.Text||'').substring(0,120) + (b.Text&&b.Text.length>120?'...':'') + '</p><div class="news-meta">📅 ' + (b.Datum||b.date||'') + '</div></div></div>'
  ).join('');
  const ma = document.getElementById('main-artikel');
  if (ma && beitraege[0]) {
    const b0 = beitraege[0];
    ma.innerHTML = '<div class="main-article" onclick=\'onlangOeffneModal(' + JSON.stringify(b0) + ')\' style="cursor:pointer;">' +
      mediaBild(b0,280) +
      '<div class="main-article-body"><div class="art-tag">' + (b0.Kategorie||'News') + '</div><h3>' + (b0.Titel||'') + '</h3><p>' + (b0.Text||'').substring(0,220) + (b0.Text&&b0.Text.length>220?'...':'') + '</p>' +
      '<div class="art-meta"><span>📅 ' + (b0.Datum||b0.date||'') + '</span><span style="color:var(--primary);font-size:.78rem;font-weight:600;margin-left:.75rem;">Weiterlesen →</span></div></div></div>';
  }
  const nl = document.getElementById('news-list');
  if (nl) nl.innerHTML = beitraege.slice(1,15).map(b =>
    '<div class="news-item" onclick=\'onlangOeffneModal(' + JSON.stringify(b) + ')\' style="cursor:pointer;">' +
    mediaBild(b,90,'120px') +
    '<div class="news-item-body"><div class="art-tag">' + (b.Kategorie||'News') + '</div><h4>' + (b.Titel||'') + '</h4><div class="art-meta">📅 ' + (b.Datum||b.date||'') + '</div></div></div>'
  ).join('');
  const mm = document.getElementById('mag-main-artikel');
  if (mm && beitraege[0]) {
    const b0 = beitraege[0];
    mm.innerHTML = '<div class="mag-main" onclick=\'onlangOeffneModal(' + JSON.stringify(b0) + ')\' style="cursor:pointer;">' +
      mediaBild(b0,240) +
      '<div class="mag-main-body"><div class="mag-tag">' + (b0.Kategorie||'News') + '</div><h3>' + (b0.Titel||'') + '</h3><p>' + (b0.Text||'').substring(0,200) + (b0.Text&&b0.Text.length>200?'...':'') + '</p><div class="mag-meta">📅 ' + (b0.Datum||b0.date||'') + '</div></div></div>';
  }
  const ms = document.getElementById('mag-side-artikel');
  if (ms) ms.innerHTML = beitraege.slice(1,5).map(b =>
    '<div class="mag-small" onclick=\'onlangOeffneModal(' + JSON.stringify(b) + ')\' style="cursor:pointer;">' +
    '<div class="mag-small-icon">' + (b.Bild_URL ? '<img src="' + b.Bild_URL + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">' : '📰') + '</div>' +
    '<div><div class="tag">' + (b.Kategorie||'News') + '</div><h4>' + (b.Titel||'') + '</h4><div class="meta">📅 ' + (b.Datum||b.date||'') + '</div></div></div>'
  ).join('');
}


// ============================================================
// ONLANG TEST – vorhandene Tabellen + Ergebnisse aus zentraler API
// Nutzt nur getTabellen / getErgebnisse. Kein neues Backend.
// ============================================================

function onlangEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

function onlangTeamLabel(teamId) {
  const teams = window._onlangTeams || [];
  const team = teams.find(t => String(t.Team_ID || '') === String(teamId || ''));
  return team ? (team.Team_Name || teamId || '') : (teamId || '');
}

function onlangEigenesTeam(teamName, suchname) {
  const tn = String(teamName || '').toLowerCase();
  const sn = String(suchname || '').toLowerCase();
  const woerter = sn.split(/\s+/).filter(w => w.length > 3);
  return !!sn && woerter.some(w => tn.includes(w));
}

function onlangFormatSportDatum(value) {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{2}\.\d{2}\.\d{4}/.test(raw)) return raw.substring(0,10);
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
    }
  } catch(e) {}
  return raw;
}

// NEU: Repariert kaputte UTF-8-Umlaute in Alt-Daten (nur Anzeige, ändert keine Sheet-Daten)
function onlangFixUmlaute(value) {
  let s = String(value ?? '');
  // Nur eingreifen, wenn ein Mojibake-Marker vorhanden ist (saubere Strings bleiben unberührt)
  if (s.indexOf('Ã') === -1 && s.indexOf('Â') === -1) return s;
  try {
    // Klassische Reparatur: als Latin-1-Bytes interpretieren und neu als UTF-8 dekodieren
    return decodeURIComponent(escape(s));
  } catch (e) {
    // Fallback: gängigste Paare direkt ersetzen
    return s
      .replace(/Ã¼/g, 'ü').replace(/Ã¶/g, 'ö').replace(/Ã¤/g, 'ä')
      .replace(/Ãœ/g, 'Ü').replace(/Ã\u009c/g, 'Ü')
      .replace(/Ã–/g, 'Ö').replace(/Ã„/g, 'Ä')
      .replace(/ÃŸ/g, 'ß').replace(/Ã\u009f/g, 'ß')
      .replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è');
  }
}

// NEU: Holt saubere Uhrzeit (HH:MM) aus Roh-Timestamps wie "Sat Dec 30 1899 18:00:00 GMT+0100 ..."
function onlangFormatSportUhrzeit(value) {
  if (!value) return '';
  const raw = String(value);
  const m = raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m) return String(m[1]).padStart(2, '0') + ':' + m[2];
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
  } catch(e) {}
  return '';
}

function wendeTabellen(tabellen) {
  const panel = document.getElementById('onlang-sportdaten-tabelle');
  if (!panel) return;

  if (!Array.isArray(tabellen) || !tabellen.length) {
    panel.innerHTML = '<div class="onlang-sportdaten-leer">Keine Tabelle verfügbar.</div>';
    return;
  }

  panel.innerHTML = tabellen.map(tab => {
    const teamId = tab.teamId || tab.Team_ID || '';
    const label = onlangFixUmlaute(onlangTeamLabel(teamId) || teamId || 'Mannschaft');
    const suchname = tab.suchname || '';
    const zeilen = Array.isArray(tab.zeilen) ? tab.zeilen : [];

    const rows = zeilen.map((z, i) => {
      const teamName = onlangFixUmlaute(z.Team_Name || z.teamName || z.teamname || z.Teamname || z.Team || '');
      const istWir = onlangEigenesTeam(teamName, suchname);
      return `<tr${istWir ? ' class="onlang-eigenes-team"' : ''}>
        <td>${onlangEsc(z.rang || z.Rang || i + 1)}</td>
        <td>${onlangEsc(teamName)}${istWir ? ' ◄' : ''}</td>
        <td class="r">${onlangEsc(z.Spiele ?? z.spiele ?? '')}</td>
        <td class="r">${onlangEsc(z.Siege ?? z.siege ?? '')}</td>
        <td class="r">${onlangEsc(z.Niederlagen ?? z.niederlagen ?? '')}</td>
        <td class="r">${onlangEsc(z.Punkte ?? z.punkte ?? '')}</td>
      </tr>`;
    }).join('');

    return `<div class="onlang-sportdaten-teamtitel">${onlangEsc(label)}</div>
      <table class="onlang-sd-table">
        <thead><tr><th>#</th><th>Team</th><th class="r">Sp.</th><th class="r">S</th><th class="r">N</th><th class="r">Pkt.</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }).join('');
}

function wendeErgebnisse(ergebnisse) {
  const panel = document.getElementById('onlang-sportdaten-ergebnisse');
  if (!panel) return;

  if (!Array.isArray(ergebnisse) || !ergebnisse.length) {
    panel.innerHTML = '<div class="onlang-sportdaten-leer">Bitte um etwas Geduld bis zum ersten Spieltag – die Ergebnisse erscheinen automatisch, sobald gespielt wurde.</div>';
    return;
  }

  const gruppen = {};
  ergebnisse.forEach(e => {
    const teamId = e.Team_ID || e.teamId || 'OHNE_TEAM';
    if (!gruppen[teamId]) gruppen[teamId] = [];
    gruppen[teamId].push(e);
  });

  panel.innerHTML = Object.entries(gruppen).map(([teamId, liste]) => {
    const label = onlangFixUmlaute(onlangTeamLabel(teamId) || teamId);
    const cards = liste.map(e => {
      const status = e.Ergebnis_Status || e.ergebnisStatus || 'Unklar';
      const statusClass =
        status === 'Sieg' ? 'sieg' :
        status === 'Niederlage' ? 'niederlage' :
        status === 'Unentschieden' ? 'unentschieden' : 'unklar';

      const heim = onlangFixUmlaute(e.Heim || e.heim || '');
      const gast = onlangFixUmlaute(e.Gast || e.gast || '');
      const endstand = String(e.Endstand || e.endstand || '').replace(/\s/g,'');
      const heimGast = e.Verein_HeimGast || e.vereinHeimGast || '';
      const heimIstWir = heimGast ? String(heimGast).toLowerCase() === 'heim' : false;
      const datum = onlangFormatSportDatum(e.Datum || e.datum || '');
      const uhrzeit = onlangFormatSportUhrzeit(e.Uhrzeit || e.uhrzeit || '');

      return `<div class="onlang-erg-card">
        <div class="onlang-erg-date">${onlangEsc(datum)}${uhrzeit ? '<br>'+onlangEsc(uhrzeit) : ''}</div>
        <div>
          <div class="onlang-erg-team${heimIstWir ? ' eigenes' : ''}">${onlangEsc(heim)}</div>
          <div class="onlang-erg-team${!heimIstWir ? ' eigenes' : ''}">${onlangEsc(gast)}</div>
        </div>
        <div class="onlang-erg-score">${onlangEsc(endstand || '–:–')}</div>
        <div class="onlang-erg-status"><span class="onlang-erg-badge ${statusClass}">${onlangEsc(status)}</span></div>
      </div>`;
    }).join('');

    return `<div class="onlang-sportdaten-teamtitel">${onlangEsc(label)}</div>
      <div class="onlang-erg-grid">${cards}</div>`;
  }).join('');
}

function wendeSportdaten(tabellen, ergebnisse) {
  // Daten zwischenspeichern, damit der Filter ohne erneuten Backend-Aufruf umschalten kann
  window._onlangTabellenData   = Array.isArray(tabellen)   ? tabellen   : [];
  window._onlangErgebnisseData = Array.isArray(ergebnisse) ? ergebnisse : [];
  onlangBaueSportfilter();
  onlangSportdatenFilter('');   // Standard: Alle Mannschaften
}

// NEU: Baut das Mannschafts-Dropdown einmalig über den Tabs
function onlangBaueSportfilter() {
  const wrap = document.querySelector('.onlang-sportdaten-wrap');
  if (!wrap) return;
  if (document.getElementById('onlang-sportdaten-filter-wrap')) return; // nur einmal bauen

  // CSS einmalig injizieren
  if (!document.getElementById('onlang-sportfilter-css')) {
    const style = document.createElement('style');
    style.id = 'onlang-sportfilter-css';
    style.textContent = `
      .onlang-sportdaten-filter-wrap { margin: 0 0 1.25rem; }
      .onlang-sportdaten-filter-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted,#888); margin-bottom:.4rem; }
      .onlang-sportdaten-select {
        width:100%; max-width:420px; padding:.75rem 2.4rem .75rem 1rem;
        border:2px solid var(--primary,#CC0000); border-radius:12px;
        background:transparent; color:inherit; font-size:1rem; font-weight:600;
        cursor:pointer; appearance:none; -webkit-appearance:none;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23CC0000' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        background-repeat:no-repeat; background-position:right 1rem center;
      }
      .onlang-sportdaten-select:focus { outline:none; }
      .onlang-sportdaten-select option { background:#1e1e2a; color:#ffffff; font-weight:600; }
      .onlang-sportdaten-select option:checked { background:var(--primary,#CC0000); color:#ffffff; }
    `;
    document.head.appendChild(style);
  }

  // Welche Team-IDs haben überhaupt Daten?
  const tabIds = new Set((window._onlangTabellenData   || []).map(t => String(t.teamId || t.Team_ID || '')));
  const ergIds = new Set((window._onlangErgebnisseData || []).map(e => String(e.Team_ID || e.teamId || '')));

  // Mandantensicher: nur eigene Teams aus der Team-Registry, die auch Daten haben
  const teams = window._onlangTeams || [];
  let optionsTeams = teams.filter(t => {
    const id = String(t.Team_ID || '');
    return id && (tabIds.has(id) || ergIds.has(id));
  });
  // Fallback: falls die Registry nicht passt, aus den vorhandenen Daten-IDs bauen
  if (!optionsTeams.length) {
    const alleIds = [...new Set([...tabIds, ...ergIds])].filter(Boolean);
    optionsTeams = alleIds.map(id => ({ Team_ID: id, Team_Name: onlangTeamLabel(id) || id }));
  }

  const optionsHtml = ['<option value="">Alle Mannschaften</option>']
    .concat(optionsTeams.map(t => {
      const id   = onlangEsc(t.Team_ID || '');
      const name = onlangEsc(onlangFixUmlaute(t.Team_Name || t.Team_ID || ''));
      return '<option value="' + id + '">' + name + '</option>';
    })).join('');

  const box = document.createElement('div');
  box.className = 'onlang-sportdaten-filter-wrap';
  box.id = 'onlang-sportdaten-filter-wrap';
  box.innerHTML =
    '<div class="onlang-sportdaten-filter-label">Mannschaft wählen</div>' +
    '<select class="onlang-sportdaten-select" id="onlang-sportdaten-select" onchange="onlangSportdatenFilter(this.value)">' +
    optionsHtml + '</select>';

  // Direkt über den Tabs einfügen
  const tabs = wrap.querySelector('.onlang-sportdaten-tabs');
  if (tabs) wrap.insertBefore(box, tabs);
  else      wrap.insertBefore(box, wrap.firstChild);
}

// NEU: Filtert Tabelle + Ergebnisse auf eine Mannschaft (leer = alle)
window.onlangSportdatenFilter = function(teamId) {
  const alleTab = window._onlangTabellenData   || [];
  const alleErg = window._onlangErgebnisseData || [];
  if (!teamId) {
    wendeTabellen(alleTab);
    wendeErgebnisse(alleErg);
  } else {
    wendeTabellen(alleTab.filter(t => String(t.teamId  || t.Team_ID || '') === String(teamId)));
    wendeErgebnisse(alleErg.filter(e => String(e.Team_ID || e.teamId || '') === String(teamId)));
  }
};

window.onlangSportdatenTab = function(tab, btn) {
  document.querySelectorAll('.onlang-sportdaten-tab').forEach(b => b.classList.remove('aktiv'));
  document.querySelectorAll('.onlang-sportdaten-panel').forEach(p => p.classList.remove('aktiv'));
  if (btn) btn.classList.add('aktiv');
  const panel = document.getElementById('onlang-sportdaten-' + tab);
  if (panel) panel.classList.add('aktiv');
};


// ============================================================
// NEU 3.2 – SPIELPLAN WIDGET
// Platzhalter in Templates: <div id="spielplan-widget"></div>
// ============================================================

function formatMatchDatum(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const tage = ['So','Mo','Di','Mi','Do','Fr','Sa'];
  return tage[d.getDay()] + ', ' + String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.';
}

function formatMatchUhrzeit(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours(), m = d.getMinutes();
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ' Uhr';
}

function erstelleMatchKarte(match, primary) {
  const gespielt = match.status === 'played' || match.status === 'result';
  const jetzt = new Date();
  const kickoff = new Date(match.kickoff_at);
  const istZukunft = kickoff > jetzt;

  // Ergebnis-Farbe
  let ergebnisHTML = '';
  if (gespielt) {
    const heimPunkte = match.home_points;
    const gastPunkte = match.away_points;
    ergebnisHTML = '<div style="text-align:center;min-width:64px;">' +
      '<div style="font-size:1.2rem;font-weight:900;color:' + primary + ';">' + heimPunkte + ' : ' + gastPunkte + '</div>' +
      '</div>';
  } else {
    ergebnisHTML = '<div style="text-align:center;min-width:64px;">' +
      '<div style="font-size:.75rem;font-weight:700;color:' + primary + ';">' + formatMatchUhrzeit(match.kickoff_at) + '</div>' +
      '<div style="font-size:.7rem;color:#999;">vs</div>' +
      '</div>';
  }

  return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:white;border-radius:10px;margin-bottom:8px;border:1px solid #eee;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
    '<div style="flex:1;min-width:0;">' +
      '<div style="font-size:.68rem;color:#999;font-weight:600;margin-bottom:2px;">' + (match.age_group||'') + ' ' + (match.gender==='weiblich'?'♀':'♂') + ' · ' + (match.league_short||'') + '</div>' +
      '<div style="font-size:.82rem;font-weight:700;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (match.home_name||'') + '</div>' +
    '</div>' +
    ergebnisHTML +
    '<div style="flex:1;min-width:0;text-align:right;">' +
      '<div style="font-size:.68rem;color:#999;margin-bottom:2px;">' + formatMatchDatum(match.kickoff_at) + '</div>' +
      '<div style="font-size:.82rem;font-weight:700;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (match.away_name||'') + '</div>' +
    '</div>' +
  '</div>';
}

async function wendeSpielplan(kundenId) {
  const container = document.getElementById('spielplan-widget');
  if (!container) return; // Kein Platzhalter im Template → überspringen

  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#CC0000';

  // CSS injizieren
  if (!document.getElementById('onlang-spielplan-css')) {
    const style = document.createElement('style');
    style.id = 'onlang-spielplan-css';
    style.textContent = `
      .onlang-spielplan-wrap { background:#f8f8f8; border-radius:14px; padding:20px; margin:24px 0; }
      .onlang-spielplan-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
      .onlang-spielplan-titel { font-size:1rem; font-weight:800; color:#111; display:flex; align-items:center; gap:8px; }
      .onlang-spielplan-tabs { display:flex; gap:6px; margin-bottom:12px; }
      .onlang-spielplan-tab { padding:6px 14px; border-radius:20px; border:none; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .15s; background:white; color:#555; }
      .onlang-spielplan-tab.aktiv { color:white; }
      .onlang-spielplan-leer { text-align:center; padding:20px; color:#999; font-size:.85rem; }
      .onlang-spielplan-mehr { display:block; width:100%; margin-top:10px; padding:10px; border-radius:8px; border:2px solid; background:transparent; font-size:.82rem; font-weight:700; cursor:pointer; transition:all .15s; }
    `;
    document.head.appendChild(style);
  }

  // Ladezustand
  container.innerHTML = '<div style="text-align:center;padding:20px;color:#999;font-size:.85rem;">⏳ Lade Spielplandaten...</div>';

  try {
    const jetzt = new Date();

    // Beide gleichzeitig laden
    const [resGespielt, resAnstehend] = await Promise.all([
      apiFetch('get_matches', kundenId, 'scope=played&limit=5'),
      apiFetch('get_matches', kundenId, 'scope=upcoming&limit=10')
    ]);

    const gespielt  = (resGespielt?.items  || []);
    const anstehend = (resAnstehend?.items || []).filter(m => new Date(m.kickoff_at) > jetzt).slice(0, 3);

    if (!gespielt.length && !anstehend.length) {
      container.innerHTML = ''; // Nichts anzeigen wenn keine Daten
      return;
    }

    // Widget aufbauen
    let html = '<div class="onlang-spielplan-wrap">' +
      '<div class="onlang-spielplan-header">' +
        '<div class="onlang-spielplan-titel">🏀 Ergebnisse & Spielplan</div>' +
      '</div>' +
      '<div class="onlang-spielplan-tabs">' +
        '<button class="onlang-spielplan-tab aktiv" id="sp-tab-ergebnisse" onclick="onlangSpielplanTab(\'ergebnisse\')" style="background:' + primary + ';">Ergebnisse</button>' +
        (anstehend.length ? '<button class="onlang-spielplan-tab" id="sp-tab-anstehend" onclick="onlangSpielplanTab(\'anstehend\')">Nächste Spiele</button>' : '') +
      '</div>';

    // Ergebnisse
    html += '<div id="sp-bereich-ergebnisse">';
    if (gespielt.length) {
      html += gespielt.slice(0,3).map(m => erstelleMatchKarte(m, primary)).join('');
    } else {
      html += '<div class="onlang-spielplan-leer">Keine Ergebnisse verfügbar</div>';
    }
    html += '</div>';

    // Nächste Spiele (versteckt)
    html += '<div id="sp-bereich-anstehend" style="display:none;">';
    if (anstehend.length) {
      html += anstehend.map(m => erstelleMatchKarte(m, primary)).join('');
    } else {
      html += '<div class="onlang-spielplan-leer">Keine kommenden Spiele</div>';
    }
    html += '</div>';

    html += '</div>'; // end wrap
    container.innerHTML = html;

    // Tab-Farbe setzen
    document.querySelectorAll('.onlang-spielplan-tab:not(.aktiv)').forEach(t => {
      t.style.border = '1px solid #ddd';
    });

  } catch(e) {
    container.innerHTML = ''; // Bei Fehler Widget ausblenden
    console.warn('ONLANG Spielplan Fehler:', e);
  }
}

// Tab-Umschalter
window.onlangSpielplanTab = function(tab) {
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#CC0000';
  ['ergebnisse','anstehend'].forEach(t => {
    const btn = document.getElementById('sp-tab-' + t);
    const bereich = document.getElementById('sp-bereich-' + t);
    if (!btn || !bereich) return;
    if (t === tab) {
      btn.classList.add('aktiv');
      btn.style.background = primary;
      btn.style.color = 'white';
      bereich.style.display = 'block';
    } else {
      btn.classList.remove('aktiv');
      btn.style.background = 'white';
      btn.style.color = '#555';
      bereich.style.display = 'none';
    }
  });
};

// ============================================================
// NEU 3.2 – LOADING
// ============================================================
function zeigeLoading(an) {
  const el = document.getElementById('onlang-loader');
  if (el) el.style.display = an ? 'flex' : 'none';
}

// ============================================================
// INIT
// ============================================================
async function onlangInit() {
  // Beim Öffnen immer oben bei der Startseite beginnen (nicht bei Spieldaten/News)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);

  const kundenId = getKundenId();
  onlangInjectModal();
  if (!kundenId) { console.log('ONLANG v3.2: Demo-Modus'); return; }
  zeigeLoading(true);

  // TEST: Tabellen + Ergebnisse werden gleichzeitig mit den bisherigen Daten gestartet.
  // Dadurch entstehen keine seriellen Zusatzwartezeiten.
  const sportdatenTask = Promise.all([
    apiFetch('getTabellen',   kundenId),
    apiFetch('getErgebnisse', kundenId)
  ]);

  const [brandingRes, beitraegeRes, settingsRes, teamsRes] = await Promise.all([
    apiFetch('get_branding',         kundenId),
    apiFetch('get_beitraege',        kundenId),
    apiFetch('get_website_settings', kundenId),
    apiFetch('get_teams',            kundenId)
  ]);

  if (brandingRes  && brandingRes.success)  wendeBranding(brandingRes.branding);
  if (settingsRes  && settingsRes.success)  wendeSettings(settingsRes.settings);
  if (teamsRes     && teamsRes.success)     wendeTeams(teamsRes.teams);
  if (beitraegeRes && beitraegeRes.success) wendeNews(beitraegeRes.rows);

  const [tabellenRes, ergebnisseRes] = await sportdatenTask;
  wendeSportdaten(
    tabellenRes && tabellenRes.success ? tabellenRes.tabellen : [],
    ergebnisseRes && ergebnisseRes.success ? ergebnisseRes.ergebnisse : []
  );

  // Bestehender Spielplan bleibt unverändert erhalten.
  await wendeSpielplan(kundenId);

  zeigeLoading(false);
  console.log('ONLANG v3.2:', kundenId,
    '| Beiträge:', beitraegeRes?.rows?.length||0,
    '| Teams:', teamsRes?.teams?.length||0,
    '| Schrift:', settingsRes?.settings?.Schrift_Familie||'Standard'
  );
}

document.addEventListener('DOMContentLoaded', onlangInit);
