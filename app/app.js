// Leonida Trophy Guide: loads the 55 trophies, renders the checklist, the
// roadmap and the missable flags, and saves progress in localStorage with
// export and import. Everything runs offline from files under app/.

const STORE_KEY = 'gta6-trophy-guide-01-progress';
const SPOILER_KEY = 'gta6-trophy-guide-01-spoilers';
const STAGE_TITLES = {
  1: 'Stage 1 — Play the story',
  2: 'Stage 2 — Side content as it opens',
  3: 'Stage 3 — Post-story cleanup',
  4: 'Stage 4 — 100% completion, then platinum',
};

const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const statusEl = document.getElementById('status');
const emptyEl = document.getElementById('emptyNote');
const kindsEl = document.getElementById('kinds');

let trophies = [];
let earned = loadEarned();
let activeKind = 'all';

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function spoilerOn() {
  return spoilerEl.checked;
}

function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

function displayName(trophy) {
  if (spoilerOn() && isStoryTrophy(trophy) && !earned.has(trophy.name)) return 'Hidden story trophy';
  return trophy.name;
}

function displayDescription(trophy) {
  if (spoilerOn() && isStoryTrophy(trophy) && !earned.has(trophy.name)) {
    return 'Hidden on PlayStation until earned — tick it off once you have it to reveal it.';
  }
  return trophy.description;
}

function gradeLabel(trophy) {
  return trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
}

function kindLabel(trophy) {
  if (trophy.kind === 'collectibles') return 'Collectibles';
  if (trophy.kind === 'activities') return 'Activities';
  if (trophy.kind === 'story') return 'Story';
  return trophy.kind.charAt(0).toUpperCase() + trophy.kind.slice(1);
}

function matchesFilters(trophy) {
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.steps ?? [])].join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function updateProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (earned.has(t.name)) byGrade[t.grade].done += 1;
  }
  document.getElementById('gradeCounts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${gradeLabel({ grade: g })} ${byGrade[g]?.done ?? 0}/${byGrade[g]?.total ?? 0}`)
    .join(' · ');
  document.getElementById('countAll').textContent = `(${total})`;
  document.getElementById('countStory').textContent = `(${trophies.filter((t) => t.kind === 'story').length})`;
  document.getElementById('countMissable').textContent = `(${trophies.filter((t) => t.missable).length})`;
  document.getElementById('countCollectibles').textContent = `(${trophies.filter((t) => t.kind === 'collectibles').length})`;
  document.getElementById('countActivities').textContent = `(${trophies.filter((t) => t.kind === 'activities').length})`;
  document.getElementById('countOnline').textContent = '(0)';
}

function updateRoadmap() {
  for (const stage of [1, 2, 3, 4]) {
    const slot = document.querySelector(`.stage-list[data-stage="${stage}"]`);
    if (!slot) continue;
    const names = trophies.filter((t) => t.stage === stage).map((t) => t.name);
    slot.textContent = `${names.length} trophies: ${names.join(' · ')}`;
  }
}

function buildCard(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(trophy.name) ? ' earned' : '');
  card.dataset.name = trophy.name;

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned();
    renderCards();
  });
  const titleWrap = document.createElement('div');
  const nameEl = document.createElement('div');
  nameEl.className = 'card-name';
  nameEl.textContent = displayName(trophy);
  if (spoilerOn() && isStoryTrophy(trophy) && !earned.has(trophy.name)) nameEl.classList.add('spoiler-hidden');
  const descEl = document.createElement('div');
  descEl.className = 'card-desc';
  descEl.textContent = displayDescription(trophy);
  titleWrap.append(nameEl, descEl);
  head.append(box, titleWrap);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const badgeDefs = [
    [gradeLabel(trophy), trophy.grade],
    [kindLabel(trophy), ''],
  ];
  for (const [label, cls] of badgeDefs) {
    const badge = document.createElement('span');
    badge.className = `badge ${cls}`.trim();
    badge.textContent = label;
    badges.append(badge);
  }
  if (trophy.hidden) {
    const badge = document.createElement('span');
    badge.className = 'badge hidden';
    badge.textContent = 'Hidden';
    badges.append(badge);
  }
  if (trophy.missable) {
    const badge = document.createElement('span');
    badge.className = 'badge missable';
    badge.textContent = 'Missable';
    badges.append(badge);
  }
  if (typeof trophy.count === 'number') {
    const badge = document.createElement('span');
    badge.className = 'badge count';
    badge.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
    badges.append(badge);
  }

  const guide = document.createElement('div');
  guide.className = 'guide';
  const guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Guide';
  const guideText = document.createElement('p');
  guideText.textContent = trophy.guide;
  guide.append(guideTitle, guideText);
  if (Array.isArray(trophy.steps) && trophy.steps.length) {
    const stepsTitle = document.createElement('h4');
    stepsTitle.textContent = 'Steps';
    const steps = document.createElement('ol');
    for (const step of trophy.steps) {
      const item = document.createElement('li');
      item.textContent = step;
      steps.append(item);
    }
    guide.append(stepsTitle, steps);
  }
  if (Array.isArray(trophy.sources) && trophy.sources.length) {
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    trophy.sources.forEach((source, index) => {
      if (index > 0) sources.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      sources.append(link);
    });
    guide.append(sources);
  }

  card.append(head, badges, guide);
  card.addEventListener('click', () => card.classList.toggle('open'));
  return card;
}

function renderCards() {
  updateProgress();
  updateRoadmap();
  cardsEl.replaceChildren();
  const visible = trophies.filter(matchesFilters);
  if (activeKind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies — all 55 GTA VI trophies are offline and single-player, so there is nothing to track here.';
  } else if (visible.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Clear the search or pick another kind or grade.';
  } else {
    emptyEl.hidden = true;
  }
  for (const trophy of visible) cardsEl.append(buildCard(trophy));
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  statusEl.textContent = `Exported ${earned.size} earned trophies.`;
}

async function importProgress(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
    renderCards();
    statusEl.textContent = `Imported ${earned.size} earned trophies.`;
  } catch {
    statusEl.textContent = 'Import failed: that file is not a trophy progress export.';
  }
}

searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
spoilerEl.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilerEl.checked));
  renderCards();
});
kindsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  for (const b of kindsEl.querySelectorAll('button')) b.classList.toggle('active', b === button);
  renderCards();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  earned = new Set();
  saveEarned();
  renderCards();
  statusEl.textContent = 'All ticks cleared.';
});

spoilerEl.checked = JSON.parse(localStorage.getItem(SPOILER_KEY) ?? 'true');
const response = await fetch('data/trophies.json');
const data = await response.json();
trophies = data.trophies;
renderCards();
