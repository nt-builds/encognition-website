// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // stagger children
      const kids = e.target.querySelectorAll('.principle-card');
      kids.forEach((k,i) => {
        k.style.opacity = '0';
        k.style.transform = 'translateY(20px)';
        k.style.transition = `opacity 0.5s ${i*0.06}s ease, transform 0.5s ${i*0.06}s ease`;
        requestAnimationFrame(() => {
          k.style.opacity = '1';
          k.style.transform = 'none';
        });
      });
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Beta slot button — disable if week is full
function initBetaSlots() {
  const btn = document.getElementById('beta-slot-btn');
  if (!btn) return;
  if (window.BETA_SLOTS_OPEN === false) {
    btn.outerHTML = '<span class="btn-slot-closed">Slots für diese Woche vergeben &nbsp;·&nbsp; Nächste Slots: Sonntag</span>';
  }
}
document.addEventListener('DOMContentLoaded', initBetaSlots);

// Cookie notice banner
function initCookieBanner() {
  if (localStorage.getItem('cookie-notice') === 'seen') return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML =
    '<span>Diese Website verwendet keine Cookies und kein Tracking. ' +
    '<a href="datenschutz.html">Datenschutzerklärung</a></span>' +
    '<button class="cookie-banner-btn" id="cookie-ok">Verstanden</button>';
  document.body.appendChild(banner);
  document.getElementById('cookie-ok').addEventListener('click', function () {
    banner.classList.add('dismissed');
    setTimeout(function () { banner.remove(); }, 350);
    localStorage.setItem('cookie-notice', 'seen');
  });
}
document.addEventListener('DOMContentLoaded', initCookieBanner);

// Science modal
function initScienceModal() {
  const backdrop = document.getElementById('science-modal');
  if (!backdrop) return;
  const numEl    = backdrop.querySelector('.sci-modal-num');
  const titleEl  = backdrop.querySelector('.sci-modal-title');
  const textEl   = backdrop.querySelector('.sci-modal-text');
  const refsEl   = backdrop.querySelector('.sci-modal-refs');
  const closeBtn = backdrop.querySelector('.sci-modal-close');
  const refs     = window.scienceRefs || {};

  function open(card) {
    numEl.textContent   = card.querySelector('.pc-number')?.textContent || '';
    titleEl.textContent = card.querySelector('.pc-title')?.textContent  || '';
    textEl.textContent  = card.dataset.science || '';
    refsEl.innerHTML    = '<p class="sci-modal-ref-label">Quellen</p>';
    const refIds = (card.dataset.refs || '').split(',').map(s => s.trim()).filter(Boolean);
    refIds.forEach(id => {
      const ref = refs[id];
      if (!ref) return;
      const a = document.createElement('a');
      a.className = 'sci-modal-ref-link';
      a.href = ref.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `<span class="sci-modal-ref-num">${id}</span>${ref.authors} — ${ref.title}`;
      refsEl.appendChild(a);
    });
    backdrop.removeAttribute('hidden');
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function close() {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.setAttribute('hidden', ''); document.body.style.overflow = ''; }, 250);
  }

  document.querySelectorAll('.principle-card[data-science]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => open(card));
  });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}
document.addEventListener('DOMContentLoaded', initScienceModal);
