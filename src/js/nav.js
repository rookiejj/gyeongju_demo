// ── 플로팅 네비게이션 공통 스크립트 ──────────────────────────────────────────
// 모든 페이지에 동일하게 삽입. 현재 경로에 따라 active 처리.

(function () {
  const pages = [
    { href: '/',         icon: '🗓', label: '여정 만들기', cls: 'page-demo'     },
    { href: '/proposal', icon: '📋', label: '서비스 제안서', cls: 'page-proposal' },
    { href: '/contest',  icon: '🏆', label: '공모전 안내',  cls: 'page-contest'  },
  ];

  // body에 현재 페이지 클래스 부여
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const current = pages.find(p =>
    p.href === '/' ? path === '' || path === '/' : path.startsWith(p.href)
  );
  if (current) document.body.classList.add(current.cls);

  // nav HTML 생성
  const nav = document.createElement('nav');
  nav.className = 'float-nav';
  nav.setAttribute('aria-label', '페이지 네비게이션');

  pages.forEach((p, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'float-nav-sep';
      nav.appendChild(sep);
    }
    const a = document.createElement('a');
    a.href = p.href;
    a.className = 'float-nav-item' + (current?.href === p.href ? ' active' : '');
    a.innerHTML = `<span class="float-nav-icon">${p.icon}</span><span class="float-nav-label">${p.label}</span>`;
    nav.appendChild(a);
  });

  // DOM 준비 후 삽입
  function inject() { document.body.appendChild(nav); }
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
