// ─── MOBILE CHECK & LAYOUT ───────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 767;

function applyMobileLayout() {
  const mobile = isMobile();
  const nav = document.querySelector('.mobile-tab-nav');

  // 네비 직접 제어 — CSS 미디어쿼리 우회
  nav.style.display = mobile ? 'flex' : 'none';

  // 풀 힌트 문구
  const hint = document.getElementById('poolHint');
  if (hint) hint.textContent = mobile
    ? '카드를 탭하면 시간대를 선택해 추가할 수 있어요!'
    : '카드를 드래그해서 타임라인에 배치하세요. 배치 순서에 따라 교통·맛집 정보가 바뀝니다!';
}

// ─── BOTTOM SHEET ────────────────────────────────────────────────────────────
let pendingCardId = null;

function openSheet(cardId) {
  pendingCardId = cardId;
  const card = CARDS.find(c => c.id === cardId);
  const overlay = document.getElementById('sheetOverlay');
  const sheet = document.getElementById('bottomSheet');
  const preview = document.getElementById('sheetCardPreview');

  preview.style.setProperty('--card-accent', card.accent);
  preview.innerHTML = `
    <div class="sheet-card-preview-emoji">${card.emoji}</div>
    <div class="sheet-card-info">
      <div class="sheet-card-name">${card.name}</div>
      <div class="sheet-card-era">${card.era}</div>
    </div>`;

  // display 먼저 설정 후 한 프레임 뒤에 애니메이션 클래스 추가
  overlay.style.display = 'block';
  sheet.style.display = 'block';
  requestAnimationFrame(() => {
    overlay.classList.add('show');
    sheet.classList.add('show');
  });
}

function closeSheet() {
  pendingCardId = null;
  const overlay = document.getElementById('sheetOverlay');
  const sheet = document.getElementById('bottomSheet');
  overlay.classList.remove('show');
  sheet.classList.remove('show');
  // 트랜지션 끝난 후 display:none
  setTimeout(() => {
    overlay.style.display = 'none';
    sheet.style.display = 'none';
  }, 320);
}

function addToSlot(slotName) {
  if (!pendingCardId) return;
  const card = CARDS.find(c => c.id === pendingCardId);
  if (!card) return;

  // 기존 슬롯에서 제거 후 새 슬롯에 추가
  ['morning', 'afternoon', 'evening'].forEach(s => {
    timeline[s] = timeline[s].filter(c => c.id !== pendingCardId);
  });
  if (!timeline[slotName].some(c => c.id === card.id)) {
    timeline[slotName].push(card);
  }

  closeSheet();
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();

  const slotKo = slotName === 'morning' ? '오전' : slotName === 'afternoon' ? '오후' : '저녁';
  showToast(`${card.name}을(를) ${slotKo}에 추가했어요!`);
}

// ─── TAB SWITCHING ───────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('pane-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
function updateBadge() {
  const total = [...timeline.morning, ...timeline.afternoon, ...timeline.evening].length;
  const badge = document.getElementById('timelineBadge');
  badge.style.display = total > 0 ? 'block' : 'none';
  badge.textContent = total;
}

// ─── STATE ───────────────────────────────────────────────────────────────────
const timeline = { morning: [], afternoon: [], evening: [] };
let dragSourceId = null;
let dragSourceSlot = null;
let updateTimer = null;

// ─── RENDER: CARD POOL ───────────────────────────────────────────────────────
function renderPool() {
  const pool = document.getElementById('cardPool');
  pool.innerHTML = '';
  CARDS.forEach(card => {
    const placed = Object.values(timeline).flat().some(c => c.id === card.id);
    if (placed) return;

    const el = document.createElement('div');
    el.className = 'story-card';
    el.style.setProperty('--card-accent', card.accent);
    el.draggable = true;
    el.dataset.cardId = card.id;
    el.innerHTML = `
      <span class="card-emoji">${card.emoji}</span>
      <div class="card-name">${card.name}</div>
      <div class="card-era">${card.era}</div>
      <div class="card-story">${card.story}</div>
      <div class="card-tags">${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    `;
    el.addEventListener('dragstart', e => {
      dragSourceId = card.id; dragSourceSlot = null;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    el.addEventListener('click', () => { if (isMobile()) openSheet(card.id); });
    pool.appendChild(el);
  });
}

// ─── RENDER: SLOT ────────────────────────────────────────────────────────────
function renderSlot(slotName) {
  const zone = document.getElementById('slot-' + slotName);
  const hint = zone.querySelector('.slot-empty-hint');
  const cards = timeline[slotName];
  zone.querySelectorAll('.placed-card, .arrow-connector').forEach(e => e.remove());
  if (hint) hint.style.display = cards.length === 0 ? 'block' : 'none';

  cards.forEach((card, idx) => {
    if (idx > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'arrow-connector';
      arrow.textContent = '→';
      zone.appendChild(arrow);
    }
    const el = document.createElement('div');
    el.className = 'placed-card';
    el.style.setProperty('--card-accent', card.accent);
    el.draggable = true;
    el.dataset.cardId = card.id;
    el.innerHTML = `
      <div class="placed-card-emoji">${card.emoji}</div>
      <div class="placed-card-name">${card.name}</div>
      <div class="placed-card-duration">⏱ ${card.duration}</div>
      <button class="remove-btn" onclick="removeCard('${card.id}','${slotName}')">✕</button>
    `;
    el.addEventListener('dragstart', e => {
      dragSourceId = card.id; dragSourceSlot = slotName;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    zone.appendChild(el);
  });
}

function renderAllSlots() {
  ['morning', 'afternoon', 'evening'].forEach(renderSlot);
}

// ─── DRAG & DROP ─────────────────────────────────────────────────────────────
function onDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function onDrop(e, targetSlot) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (!dragSourceId) return;
  const card = CARDS.find(c => c.id === dragSourceId);
  if (!card) return;
  if (dragSourceSlot) timeline[dragSourceSlot] = timeline[dragSourceSlot].filter(c => c.id !== dragSourceId);
  if (!timeline[targetSlot].some(c => c.id === card.id)) timeline[targetSlot].push(card);
  dragSourceId = null; dragSourceSlot = null;
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();
}

function removeCard(cardId, slotName) {
  timeline[slotName] = timeline[slotName].filter(c => c.id !== cardId);
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();
}

// ─── INFO UPDATE ─────────────────────────────────────────────────────────────
function triggerInfoUpdate() {
  const ind = document.getElementById('updatingIndicator');
  ind.classList.add('show');
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => { updateInfoPanel(); ind.classList.remove('show'); }, 600);
}

function updateInfoPanel() {
  const allCards = [...timeline.morning, ...timeline.afternoon, ...timeline.evening];
  if (allCards.length === 0) {
    document.getElementById('transportInfo').innerHTML = '<div class="info-empty">카드를 타임라인에 배치하면<br>이동 구간별 교통편을 알려드릴게요!</div>';
    document.getElementById('foodInfo').innerHTML = '<div class="info-empty">방문지마다 근처 맛집을<br>추천해드릴게요!</div>';
    document.getElementById('summarySection').innerHTML = '';
    return;
  }
  const sequence = [];
  ['morning', 'afternoon', 'evening'].forEach(slot => timeline[slot].forEach(card => sequence.push({ card, slot })));
  const slotLabel = { morning: '오전', afternoon: '오후', evening: '저녁' };

  let tHTML = '';
  for (let i = 0; i < sequence.length; i++) {
    const fromId = i === 0 ? 'START' : sequence[i - 1].card.id;
    const fromName = i === 0 ? '경주역 (출발)' : sequence[i - 1].card.name;
    const { card, slot } = sequence[i];
    const options = LEG_TRANSPORT[`${fromId}_${card.id}`] || [{ icon: '🗺', desc: '경주 시티투어버스 1일권', time: '15,000원 · 주요 명소 순환' }];
    tHTML += `<div class="leg-card">
      <div class="leg-header"><span class="leg-from">${fromName}</span><span class="leg-arrow">▶</span><span class="leg-to">${card.name}</span><span class="leg-slot-badge ${slot}">${slotLabel[slot]}</span></div>
      <div class="leg-options">${options.map(o => `<div class="leg-option"><div class="leg-option-icon">${o.icon}</div><div class="leg-option-detail">${o.desc}<br><span class="leg-option-time">${o.time}</span></div></div>`).join('')}</div>
    </div>`;
  }
  document.getElementById('transportInfo').innerHTML = tHTML;

  let fHTML = '';
  allCards.forEach(card => {
    const data = CARD_FOOD[card.id]; if (!data) return;
    fHTML += `<div class="place-food-card">
      <div class="place-food-header"><span class="place-emoji">${card.emoji}</span><span>${card.name}</span><span class="place-sub">· ${data.label}</span></div>
      <div class="food-list">${data.items.map(f => `<div class="food-item"><div style="font-size:18px;flex-shrink:0">${f.emoji}</div><div class="food-detail"><div class="food-name">${f.name}</div>${f.desc}</div></div>`).join('')}</div>
    </div>`;
  });
  document.getElementById('foodInfo').innerHTML = fHTML || '<div class="info-empty">맛집 정보를 불러오는 중...</div>';

  const totalH = allCards.reduce((s, c) => s + parseInt(c.duration.split('–')[0]) + 0.5, 0);
  const hasEast = allCards.some(c => ['bulguksa', 'seokguram'].includes(c.id));
  const hasYd = allCards.some(c => c.id === 'yangdong');
  document.getElementById('summarySection').innerHTML = `
    <div class="total-summary">
      <div class="summary-title">📊 여정 요약</div>
      <div class="summary-row"><span>선택 명소</span><span class="summary-val">${allCards.length}곳</span></div>
      <div class="summary-row"><span>예상 소요</span><span class="summary-val">약 ${Math.round(totalH)}시간</span></div>
      <div class="summary-row"><span>이동 거리</span><span class="summary-val">약 ${hasEast ? '35' : hasYd ? '25' : '8'}km</span></div>
    </div>`;
}

// ─── CONFIRM ─────────────────────────────────────────────────────────────────
function confirmPlan() {
  const allCards = [...timeline.morning, ...timeline.afternoon, ...timeline.evening];
  if (allCards.length === 0) { showToast('먼저 방문하고 싶은 곳을 타임라인에 배치해주세요! 🗺'); return; }
  showToast(`✨ ${allCards.map(c => c.name).join(' → ')} 여정 확정!`);
  if (isMobile()) switchTab('info');
  updateInfoPanel();
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
applyMobileLayout();
window.addEventListener('resize', applyMobileLayout);
renderPool();
renderAllSlots();