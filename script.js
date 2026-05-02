const root = document.documentElement;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.progress');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const copyEmailButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');
const email = 'hello@siqixie.example';

const storedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (storedTheme || prefersDark) {
  root.dataset.theme = storedTheme || 'dark';
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateThemeIcon() {
  const icon = themeToggle?.querySelector('i');
  if (!icon) return;
  icon.setAttribute('data-lucide', root.dataset.theme === 'dark' ? 'sun' : 'moon');
  refreshIcons();
}

function updateScrollState() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  header?.classList.toggle('scrolled', document.body.classList.contains('subpage') || scrollTop > 24);
  if (progress) progress.style.width = `${progressValue}%`;
}

function animateMetric(signal) {
  const metric = signal.querySelector('.metric');
  const target = Number(signal.dataset.count || 0);
  if (!metric || signal.dataset.animated) return;
  signal.dataset.animated = 'true';

  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    metric.textContent = Math.round(target * eased).toString();

    if (progressValue < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('signal')) animateMetric(entry.target);
    });
  },
  { threshold: 0.22 }
);

document.querySelectorAll('.reveal, .signal').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    document.querySelectorAll('[data-filter]').forEach((segment) => {
      const active = segment === button;
      segment.classList.toggle('active', active);
      segment.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.case-card').forEach((card) => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('.case-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-3px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

navToggle?.addEventListener('click', () => {
  const open = !nav?.classList.contains('open');
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navToggle.querySelector('i')?.setAttribute('data-lucide', open ? 'x' : 'menu');
  refreshIcons();
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-label', 'Open navigation');
    navToggle?.querySelector('i')?.setAttribute('data-lucide', 'menu');
    refreshIcons();
  });
});

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
  updateThemeIcon();
});

copyEmailButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = 'Email copied.';
  } catch {
    copyStatus.textContent = email;
  }

  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 2400);
});

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('load', () => {
  refreshIcons();
  updateThemeIcon();
  updateScrollState();
});
