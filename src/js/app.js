// ─── MOBILE CHECK & LAYOUT ───────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 767;

function applyMobileLayout() {
  const mobile = isMobile();
  document.querySelector('.mobile-tab-nav').style.display = mobile ? 'flex' : 'none';
  const hint = document.getElementById('poolHint');
  if (hint) hint.textContent = mobile
    ? '카드를 탭하면 시간대를 선택해 추가할 수 있어요! 배치된 카드는 꾹 눌러서 위치를 바꿀 수 있어요.'
    : '카드를 드래그해서 타임라인에 배치하세요. 배치된 카드는 드래그로 순서를 바꿀 수 있어요.';
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
  setTimeout(() => {
    overlay.style.display = 'none';
    sheet.style.display = 'none';
  }, 320);
}

function addToSlot(slotName) {
  if (!pendingCardId) return;
  const card = CARDS.find(c => c.id === pendingCardId);
  if (!card) return;
  ['morning', 'afternoon', 'evening'].forEach(s => {
    timeline[s] = timeline[s].filter(c => c.id !== pendingCardId);
  });
  if (!timeline[slotName].some(c => c.id === card.id)) timeline[slotName].push(card);
  closeSheet();
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();
  const ko = slotName === 'morning' ? '오전' : slotName === 'afternoon' ? '오후' : '저녁';
  showToast(`${card.name}을(를) ${ko}에 추가했어요!`);
}

// ─── TAB SWITCHING ───────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('pane-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

function updateBadge() {
  const total = [...timeline.morning, ...timeline.afternoon, ...timeline.evening].length;
  const badge = document.getElementById('timelineBadge');
  badge.style.display = total > 0 ? 'block' : 'none';
  badge.textContent = total;
}

// ─── STATE ───────────────────────────────────────────────────────────────────
const timeline = { morning: [], afternoon: [], evening: [] };
let updateTimer = null;

// ─── DRAG STATE ──────────────────────────────────────────────────────────────
let dragSourceId = null;
let dragSourceSlot = null;

// ─── TOUCH DRAG STATE ────────────────────────────────────────────────────────
let touchLongPressTimer = null;
let touchDragActive = false;
let touchDragCardId = null;
let touchDragSlot = null;
let touchGhost = null;

// ─── INSERTION HELPERS ───────────────────────────────────────────────────────
// 드래그 위치 기준으로 어느 카드 앞에 삽입할지 반환 (null = 맨 뒤)
function getAfterElement(zone, clientX, clientY) {
  const vertical = isMobile();
  const cards = [...zone.querySelectorAll('.placed-card:not(.drag-ghost-placeholder)')];
  let closest = { offset: Number.NEGATIVE_INFINITY, el: null };
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const offset = vertical
      ? clientY - rect.top - rect.height / 2
      : clientX - rect.left - rect.width / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset, el: card };
  });
  return closest.el; // null = 맨 뒤에 삽입
}

function getInsertIndex(zone, afterEl) {
  const cards = [...zone.querySelectorAll('.placed-card:not(.drag-ghost-placeholder)')];
  if (!afterEl) return cards.length;
  return cards.indexOf(afterEl);
}

// 삽입 위치 표시선 업데이트
function updateInsertLine(zone, afterEl) {
  zone.querySelectorAll('.insert-line').forEach(l => l.remove());
  const line = document.createElement('div');
  line.className = 'insert-line';
  if (!afterEl) {
    zone.appendChild(line);
  } else {
    zone.insertBefore(line, afterEl);
  }
}

function clearInsertLine(zone) {
  if (zone) zone.querySelectorAll('.insert-line').forEach(l => l.remove());
}

// ─── PERFORM DROP (공통) ─────────────────────────────────────────────────────
function performDrop(cardId, fromSlot, toSlot, insertIdx) {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;
  // 기존 위치에서 제거
  if (fromSlot) timeline[fromSlot] = timeline[fromSlot].filter(c => c.id !== cardId);
  // 중복 제거
  timeline[toSlot] = timeline[toSlot].filter(c => c.id !== cardId);
  // 원하는 위치에 삽입
  const idx = Math.min(insertIdx, timeline[toSlot].length);
  timeline[toSlot].splice(idx, 0, card);
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();
}

// ─── DESKTOP DRAG & DROP ─────────────────────────────────────────────────────
function onDragOver(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.add('drag-over');
  const afterEl = getAfterElement(zone, e.clientX, e.clientY);
  updateInsertLine(zone, afterEl);
}

function onDragLeave(e) {
  // relatedTarget 이 zone 내부면 무시
  if (e.currentTarget.contains(e.relatedTarget)) return;
  e.currentTarget.classList.remove('drag-over');
  clearInsertLine(e.currentTarget);
}

function onDrop(e, targetSlot) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('drag-over');
  if (!dragSourceId) return;
  const afterEl = getAfterElement(zone, e.clientX, e.clientY);
  const idx = getInsertIndex(zone, afterEl);
  clearInsertLine(zone);
  performDrop(dragSourceId, dragSourceSlot, targetSlot, idx);
  dragSourceId = null; dragSourceSlot = null;
}

function removeCard(cardId, slotName) {
  timeline[slotName] = timeline[slotName].filter(c => c.id !== cardId);
  renderPool(); renderAllSlots(); updateBadge(); triggerInfoUpdate();
}

// ─── TOUCH DRAG (모바일 롱프레스) ────────────────────────────────────────────
function createGhost(card, touchX, touchY) {
  touchGhost = document.createElement('div');
  touchGhost.className = 'touch-ghost';
  touchGhost.style.setProperty('--card-accent', card.accent);
  touchGhost.innerHTML = `<span>${card.emoji}</span> ${card.name}`;
  document.body.appendChild(touchGhost);
  moveGhost(touchX, touchY);
}

function moveGhost(touchX, touchY) {
  if (!touchGhost) return;
  touchGhost.style.left = (touchX - 60) + 'px';
  touchGhost.style.top = (touchY - 30) + 'px';
}

function removeGhost() {
  if (touchGhost) { touchGhost.remove(); touchGhost = null; }
}

function bindTouchDrag(el, card, slotName) {
  el.addEventListener('touchstart', e => {
    // 삭제 버튼은 무시
    if (e.target.classList.contains('remove-btn')) return;
    const t = e.touches[0];
    touchLongPressTimer = setTimeout(() => {
      touchDragActive = true;
      touchDragCardId = card.id;
      touchDragSlot = slotName;
      el.classList.add('dragging');
      if (navigator.vibrate) navigator.vibrate(60);
      createGhost(card, t.clientX, t.clientY);
    }, 480);
  }, { passive: true });

  el.addEventListener('touchmove', e => {
    if (!touchDragActive) { clearTimeout(touchLongPressTimer); return; }
    e.preventDefault();
    const t = e.touches[0];
    moveGhost(t.clientX, t.clientY);

    // 현재 손가락 아래의 drop zone 찾기
    touchGhost.style.display = 'none';
    const elBelow = document.elementFromPoint(t.clientX, t.clientY);
    touchGhost.style.display = '';
    const zone = elBelow?.closest('.slot-drop-zone');

    document.querySelectorAll('.slot-drop-zone').forEach(z => {
      z.classList.remove('drag-over');
      clearInsertLine(z);
    });
    if (zone) {
      zone.classList.add('drag-over');
      const afterEl = getAfterElement(zone, t.clientX, t.clientY);
      updateInsertLine(zone, afterEl);
    }
  }, { passive: false });

  el.addEventListener('touchend', e => {
    clearTimeout(touchLongPressTimer);
    if (!touchDragActive) return;

    const t = e.changedTouches[0];
    touchGhost.style.display = 'none';
    const elBelow = document.elementFromPoint(t.clientX, t.clientY);
    touchGhost.style.display = '';
    const zone = elBelow?.closest('.slot-drop-zone');

    document.querySelectorAll('.slot-drop-zone').forEach(z => {
      z.classList.remove('drag-over');
      clearInsertLine(z);
    });
    el.classList.remove('dragging');

    if (zone) {
      const targetSlot = zone.dataset.slot;
      const afterEl = getAfterElement(zone, t.clientX, t.clientY);
      const idx = getInsertIndex(zone, afterEl);
      performDrop(touchDragCardId, touchDragSlot, targetSlot, idx);
    }

    touchDragActive = false; touchDragCardId = null; touchDragSlot = null;
    removeGhost();
  }, { passive: true });

  el.addEventListener('touchcancel', () => {
    clearTimeout(touchLongPressTimer);
    el.classList.remove('dragging');
    touchDragActive = false; touchDragCardId = null; touchDragSlot = null;
    removeGhost();
    document.querySelectorAll('.slot-drop-zone').forEach(z => {
      z.classList.remove('drag-over'); clearInsertLine(z);
    });
  }, { passive: true });
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
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
      <div class="card-tags">${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
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
      <button class="remove-btn" onclick="removeCard('${card.id}','${slotName}')">✕</button>`;
    // 데스크탑 드래그
    el.addEventListener('dragstart', e => {
      dragSourceId = card.id; dragSourceSlot = slotName;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      document.querySelectorAll('.slot-drop-zone').forEach(z => {
        z.classList.remove('drag-over'); clearInsertLine(z);
      });
    });
    // 모바일 터치 드래그
    bindTouchDrag(el, card, slotName);
    zone.appendChild(el);
  });
}

function renderAllSlots() {
  ['morning', 'afternoon', 'evening'].forEach(renderSlot);
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