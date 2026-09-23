/* =========================
MENÚ MÓVIL
========================= */
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

function closeMenu() {
  navMenu.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================
SLIDER DE LA PORTADA
========================= */
// Cada diapositiva: la obra completa (sin recortar ni ampliar) sobre un
// fondo desenfocado de la misma imagen. El ken-burns solo mueve el fondo.
const slides = document.querySelectorAll('.hero-slide');

// Solo la primera diapositiva se descarga al entrar; cada una de las
// siguientes se pide una vuelta antes de mostrarse.
function loadSlide(slide) {
  slide.querySelectorAll('img[data-src]').forEach(img => {
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  });
}

// Cartela con el título y la técnica de la obra que se muestra
const caption = document.querySelector('.hero-caption');

function updateCaption(slide) {
  if (!caption) return;
  caption.classList.add('changing');
  setTimeout(() => {
    caption.querySelector('em').textContent = slide.dataset.title;
    caption.querySelector('span').textContent = slide.dataset.meta;
    caption.classList.remove('changing');
  }, 600);
}

if (slides.length > 1 && !reducedMotion) {
  let i = 0;
  loadSlide(slides[1]);

  const setKenBurns = (slide) => {
    slide.querySelector('.hero-backdrop').style.transform =
      Math.random() > 0.5 ? 'scale(1.3)' : 'scale(1.2)';
  };
  slides.forEach(setKenBurns);

  setInterval(() => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    setKenBurns(slides[i]);
    slides[i].classList.add('active');
    loadSlide(slides[(i + 1) % slides.length]);
    updateCaption(slides[i]);
  }, 4500);
}

/* =========================
PARALLAX SUTIL EN EL HERO
========================= */
const heroSlider = document.querySelector('.hero-slider');
if (heroSlider && !reducedMotion) {
  window.addEventListener('scroll', () => {
    heroSlider.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }, { passive: true });
}

/* =========================
SCROLL REVEAL
========================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* =========================
FILTROS
========================= */
const filters = document.querySelectorAll('.filter');

filters.forEach(f => {
  f.addEventListener('click', () => {
    filters.forEach(b => {
      b.classList.toggle('active', b === f);
      b.setAttribute('aria-pressed', String(b === f));
    });
    const filter = f.dataset.filter;
    document.querySelectorAll('.artwork-row').forEach(a => {
      const show = filter === 'all' || a.dataset.category.split(' ').includes(filter);
      a.style.display = show ? '' : 'none';
    });
  });
});

/* =========================
FICHA TÉCNICA
En escritorio la obra se gira; en móvil la ficha se despliega debajo.
========================= */
const isDesktop = window.matchMedia('(min-width: 900px)');

function setSheet(media, open, moveFocus) {
  const hint = media.querySelector('.art-flip-hint');
  const back = media.querySelector('.art-face-back');
  media.classList.toggle('flipped', open);
  hint.setAttribute('aria-expanded', String(open));
  hint.tabIndex = open ? -1 : 0;
  back.inert = !open;
  if (moveFocus) {
    (open ? media.querySelector('.art-back-close') : hint).focus({ preventScroll: true });
  }
}

document.querySelectorAll('.artwork-media').forEach(media => {
  setSheet(media, false, false);

  media.addEventListener('click', (e) => {
    // e.detail === 0: activado con teclado, así que movemos el foco
    const byKeyboard = e.detail === 0;
    if (e.target.closest('.art-back-close')) {
      setSheet(media, false, byKeyboard);
    } else if (e.target.closest('.art-face-back')) {
      // En móvil, tocar el texto de la ficha no la cierra
      if (isDesktop.matches) setSheet(media, false, false);
    } else {
      setSheet(media, !media.classList.contains('flipped'), byKeyboard);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.artwork-media.flipped').forEach(m => setSheet(m, false, m.contains(document.activeElement)));
  if (navMenu.classList.contains('open')) {
    closeMenu();
    menuToggle.focus();
  }
});

/* =========================
PLAN PRESELECCIONADO (/contacto/?plan=profesional)
========================= */
const planSelect = document.getElementById('f-plan');
if (planSelect) {
  const plan = new URLSearchParams(location.search).get('plan');
  if (plan && planSelect.querySelector(`option[value="${CSS.escape(plan)}"]`)) {
    planSelect.value = plan;
  }
}

/* =========================
AÑO EN FOOTER
========================= */
document.getElementById('year').textContent = new Date().getFullYear();
