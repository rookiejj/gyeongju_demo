// ─── STATE ──────────────────────────────────────────────────────────────────
const timeline = { morning: [], afternoon: [], evening: [] };
let dragSourceId   = null;
let dragSourceSlot = null; // null = 카드풀에서 드래그
let updateTimer    = null;

// ─── RENDER: CARD POOL ──────────────────────────────────────────────────────
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
      dragSourceId   = card.id;
      dragSourceSlot = null;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    pool.appendChild(el);
  });
}

// ─── RENDER: TIMELINE SLOT ──────────────────────────────────────────────────
function renderSlot(slotName) {
  const zone  = document.getElementById('slot-' + slotName);
  const hint  = zone.querySelector('.slot-empty-hint');
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
      <button class="remove-btn" onclick="removeCard('${card.id}','${slotName}')">✕</button>
      <div class="placed-card-emoji">${card.emoji}</div>
      <div class="placed-card-name">${card.name}</div>
      <div class="placed-card-duration">⏱ ${card.duration}</div>
    `;
    el.addEventListener('dragstart', e => {
      dragSourceId   = card.id;
      dragSourceSlot = slotName;
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
function onDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function onDrop(e, targetSlot) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragSourceId) return;

  const card = CARDS.find(c => c.id === dragSourceId);
  if (!card) return;

  // 기존 슬롯에서 제거
  if (dragSourceSlot) {
    timeline[dragSourceSlot] = timeline[dragSourceSlot].filter(c => c.id !== dragSourceId);
  }
  // 대상 슬롯에 추가 (중복 방지)
  if (!timeline[targetSlot].some(c => c.id === card.id)) {
    timeline[targetSlot].push(card);
  }

  dragSourceId   = null;
  dragSourceSlot = null;
  renderPool();
  renderAllSlots();
  triggerInfoUpdate();
}

function removeCard(cardId, slotName) {
  timeline[slotName] = timeline[slotName].filter(c => c.id !== cardId);
  renderPool();
  renderAllSlots();
  triggerInfoUpdate();
}

// ─── INFO PANEL UPDATE ───────────────────────────────────────────────────────
function triggerInfoUpdate() {
  const indicator = document.getElementById('updatingIndicator');
  indicator.classList.add('show');
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    updateInfoPanel();
    indicator.classList.remove('show');
  }, 600);
}

function updateInfoPanel() {
  const allCards = [...timeline.morning, ...timeline.afternoon, ...timeline.evening];

  if (allCards.length === 0) {
    document.getElementById('transportInfo').innerHTML =
      '<div class="info-empty">카드를 타임라인에 배치하면<br>이동 구간별 교통편을 알려드릴게요!</div>';
    document.getElementById('foodInfo').innerHTML =
      '<div class="info-empty">방문지마다 근처 맛집을<br>추천해드릴게요!</div>';
    document.getElementById('summarySection').innerHTML = '';
    return;
  }

  // 전체 순서 배열 생성
  const sequence = [];
  ['morning', 'afternoon', 'evening'].forEach(slot => {
    timeline[slot].forEach(card => sequence.push({ card, slot }));
  });

  const slotLabel = { morning: '오전', afternoon: '오후', evening: '저녁' };

  // ── 교통편: 구간별 ──────────────────────────────────────────────────────
  let transportHTML = '';
  for (let i = 0; i < sequence.length; i++) {
    const fromId   = i === 0 ? 'START' : sequence[i - 1].card.id;
    const fromName = i === 0 ? '경주역 (출발)' : sequence[i - 1].card.name;
    const toId     = sequence[i].card.id;
    const toName   = sequence[i].card.name;
    const slot     = sequence[i].slot;
    const key      = `${fromId}_${toId}`;
    const options  = LEG_TRANSPORT[key] || [{ icon: '🗺', desc: '경주 시티투어버스 1일권 이용', time: '15,000원 · 주요 명소 순환' }];

    transportHTML += `
      <div class="leg-card">
        <div class="leg-header">
          <span class="leg-from">${fromName}</span>
          <span class="leg-arrow">▶</span>
          <span class="leg-to">${toName}</span>
          <span class="leg-slot-badge ${slot}">${slotLabel[slot]}</span>
        </div>
        <div class="leg-options">
          ${options.map(opt => `
            <div class="leg-option">
              <div class="leg-option-icon">${opt.icon}</div>
              <div class="leg-option-detail">
                ${opt.desc}<br>
                <span class="leg-option-time">${opt.time}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }
  document.getElementById('transportInfo').innerHTML = transportHTML;

  // ── 맛집: 명소별 ────────────────────────────────────────────────────────
  let foodHTML = '';
  allCards.forEach(card => {
    const data = CARD_FOOD[card.id];
    if (!data) return;
    foodHTML += `
      <div class="place-food-card">
        <div class="place-food-header">
          <span class="place-emoji">${card.emoji}</span>
          <span>${card.name}</span>
          <span class="place-sub">· ${data.label}</span>
        </div>
        <div class="food-list">
          ${data.items.map(f => `
            <div class="food-item">
              <div style="font-size:18px;flex-shrink:0">${f.emoji}</div>
              <div class="food-detail">
                <div class="food-name">${f.name}</div>
                ${f.desc}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  });
  document.getElementById('foodInfo').innerHTML =
    foodHTML || '<div class="info-empty">맛집 정보를 불러오는 중...</div>';

  // ── 요약 ──────────────────────────────────────────────────────────────────
  const totalHours = allCards.reduce((sum, c) => {
    return sum + parseInt(c.duration.split('–')[0]) + 0.5;
  }, 0);
  const hasEast     = allCards.some(c => ['bulguksa', 'seokguram'].includes(c.id));
  const hasYangdong = allCards.some(c => c.id === 'yangdong');

  document.getElementById('summarySection').innerHTML = `
    <div class="total-summary">
      <div class="summary-title">📊 여정 요약</div>
      <div class="summary-row"><span>선택 명소</span><span class="summary-val">${allCards.length}곳</span></div>
      <div class="summary-row"><span>예상 소요</span><span class="summary-val">약 ${Math.round(totalHours)}시간</span></div>
      <div class="summary-row"><span>이동 거리</span><span class="summary-val">약 ${hasEast ? '35' : hasYangdong ? '25' : '8'}km</span></div>
    </div>`;
}

// ─── CONFIRM ─────────────────────────────────────────────────────────────────
function confirmPlan() {
  const allCards = [...timeline.morning, ...timeline.afternoon, ...timeline.evening];
  if (allCards.length === 0) {
    showToast('먼저 방문하고 싶은 곳을 타임라인에 배치해주세요! 🗺');
    return;
  }
  showToast(`✨ ${allCards.map(c => c.name).join(' → ')} 여정이 확정됐어요!`);
  updateInfoPanel();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderPool();
renderAllSlots();
