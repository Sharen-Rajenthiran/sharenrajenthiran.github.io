// Run or stop animations
const toggle = document.getElementById('switch-component-desc');
let running = toggle?.checked ?? true;
if (toggle) {
  toggle.addEventListener('change', () => {
    running = toggle.checked;

    if (running) {
      start();
    } else {
      stop();
    }

  });
}

// Update footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Preloader fade out on load
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  preloader.style.transition = 'opacity .5s ease';
  preloader.style.opacity = '0';
  setTimeout(() => preloader.remove(), 550);
});

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  // Close on nav click
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => mobileMenu.classList.add('hidden'))
  );
}

// Reveal on scroll using IntersectionObserver
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => io.observe(el));

// Active nav link highlighting
const sections = [
  'skills',
  'summary',
  'experience',
  'projects',
  'education',
  'awards',
  'certifications',
  'contact',
].map((id) => document.getElementById(id)).filter(Boolean);

const navLinks = Array.from(document.querySelectorAll('.nav-link'));

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(`#${id}`)) {
      link.classList.add('bg-white/10', 'text-white');
      link.classList.remove('text-white/80');
    } else {
      link.classList.remove('bg-white/10', 'text-white');
      link.classList.add('text-white/80');
    }
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px', // focus middle of viewport
    threshold: 0.01,
  }
);
sections.forEach((sec) => sectionObserver.observe(sec));

// If I want to use this, add data-video="<url>" on the project card container
const projectCards = document.querySelectorAll('[data-video]');
projectCards.forEach((card) => {
  const videoUrl = card.getAttribute('data-video');
  const video = card.querySelector('video');
  const img = card.querySelector('img');
  if (!video || !img || !videoUrl) return;
  video.src = videoUrl;
  card.addEventListener('mouseenter', () => {
    img.classList.add('hidden');
    video.classList.remove('hidden');
    video.play().catch(() => {});
  });
  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    video.classList.add('hidden');
    img.classList.remove('hidden');
  });
});

// Modal gallery for Demo Pictures buttons
const galleryModal = document.getElementById('galleryModal');
const galleryContent = document.getElementById('galleryContent');
const galleryClose = document.getElementById('galleryClose');
const galleryBackdrop = document.getElementById('galleryBackdrop');
let currentGallery = [];
let currentIndex = 0;

function openGallery(urls) {
  if (!galleryModal || !galleryContent) return;
  // Clear previous
  galleryContent.innerHTML = '';
  urls.forEach((src) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-xl overflow-hidden border border-white/10 bg-white/5 p-2';
    const img = document.createElement('img');
    img.src = src.trim();
    img.alt = 'Demo picture';
    img.className = 'w-full h-56 object-contain bg-slate-900/40 rounded-lg';
    wrapper.appendChild(img);
    galleryContent.appendChild(wrapper);
  });
  galleryModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  if (!galleryModal) return;
  galleryModal.classList.add('hidden');
  document.body.style.overflow = '';
}

async function resolveGallery(attr) {
  // Comma-separated URLs
  if (attr.includes(',')) {
    return attr.split(',').map((s) => s.trim()).filter(Boolean);
  }
  // Treat as folder if trailing '/'
  if (attr.endsWith('/')) {
    try {
      const res = await fetch(attr + 'gallery.json', { cache: 'no-store' });
      if (res.ok) {
        const files = await res.json(); // expects ["img1.jpg", "img2.png", ...]
        if (Array.isArray(files)) {
          return files.map((f) => attr + f);
        }
      }
    } catch (e) {
      // ignore and fall through
    }
    return [];
  }
  // Single URL
  return attr ? [attr] : [];
}

document.querySelectorAll('[data-gallery]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const attr = btn.getAttribute('data-gallery') || '';
    const urls = await resolveGallery(attr);
    if (urls.length) {
      openGallery(urls);
    } else if (galleryContent) {
      galleryContent.innerHTML = '<p class="text-white/70">No demo pictures found. If you provided a folder, add a gallery.json manifest with an array of filenames.</p>';
      galleryModal?.classList.remove('hidden');
    }
  });
});

// Lightbox for full-size viewing
const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxClose = document.getElementById('lightboxClose');

function showLightboxImage() {
  if (!lightboxImg || !currentGallery.length) return;
  lightboxImg.src = currentGallery[currentIndex];
}

function openLightboxWithIndex(idx) {
  if (!lightbox) return;
  currentIndex = ((idx % currentGallery.length) + currentGallery.length) % currentGallery.length;
  showLightboxImage();
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
}

if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }
  // Left/Right arrows when lightbox is open
  const lightboxOpen = lightbox && !lightbox.classList.contains('hidden');
  if (lightboxOpen && currentGallery.length) {
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      showLightboxImage();
    } else if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % currentGallery.length;
      showLightboxImage();
    }
  }
});

// Attach click to gallery images after gallery is opened and set current gallery
const originalOpenGallery = openGallery;
openGallery = function(urls) { // eslint-disable-line no-global-assign
  currentGallery = urls.slice();
  originalOpenGallery(urls);
  // Defer to allow DOM render
  setTimeout(() => {
    const imgs = Array.from(document.querySelectorAll('#galleryContent img'));
    imgs.forEach((img, idx) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightboxWithIndex(idx));
    });
  }, 0);
};

// Prev/Next controls
const btnPrev = document.getElementById('lightboxPrev');
const btnNext = document.getElementById('lightboxNext');
if (btnPrev) btnPrev.addEventListener('click', () => {
  if (!currentGallery.length) return;
  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
  showLightboxImage();
});
if (btnNext) btnNext.addEventListener('click', () => {
  if (!currentGallery.length) return;
  currentIndex = (currentIndex + 1) % currentGallery.length;
  showLightboxImage();
});

if (galleryClose) galleryClose.addEventListener('click', closeGallery);
if (galleryBackdrop) galleryBackdrop.addEventListener('click', closeGallery);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGallery();
});

const equationBg = document.getElementById('equationBg');
if (equationBg instanceof HTMLCanvasElement) {
  const ctx = equationBg.getContext('2d', { alpha: true });
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const equations = [
    // 'Gμν + Λ gμν = (8πG/c⁴) Tμν',
    // 'Rμν − ½R gμν = (8πG/c⁴) Tμν',
    // '∇μ Tμν = 0',
    // 'R = gμν Rμν',
    // 'ds² = gμν dxμ dxν',
    // 'Γρμν = ½ gρσ(∂μ gνσ + ∂ν gμσ − ∂σ gμν)',
  ];

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  };

  const blackHole = {
    x: 0,
    y: 0,
    strength: 220000,
    softening: 1200,
  };

  const rand = (min, max) => min + Math.random() * (max - min);

  const nodes = Array.from({ length: 18 }, () => ({
    text: equations[Math.floor(Math.random() * equations.length)],
    x: rand(0, 1),
    y: rand(0, 1),
    vx: rand(-0.014, 0.014),
    vy: rand(0.004, 0.02),
    rot: rand(-0.12, 0.12),
    vr: rand(-0.006, 0.006),
    size: rand(12, 18),
    alpha: rand(0.18, 0.42),
    tint: Math.random() < 0.25,
  }));

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const warpPoint = (px, py) => {
    // Warp toward the black hole (strong) and cursor (gentle).
    const dx = px - blackHole.x;
    const dy = py - blackHole.y;
    const r2 = dx * dx + dy * dy + blackHole.softening;
    const inv = blackHole.strength / r2;
    let wx = px - dx * inv;
    let wy = py - dy * inv;

    const mx = pointer.active ? pointer.x : blackHole.x;
    const my = pointer.active ? pointer.y : blackHole.y;
    const mdx = px - mx;
    const mdy = py - my;
    const mr2 = mdx * mdx + mdy * mdy + 3200;
    const minv = 52000 / mr2;
    wx -= mdx * minv;
    wy -= mdy * minv;

    return { x: wx, y: wy };
  };

  const drawBlackHole = () => {
    if (!running) return;
    
    if (!ctx) return;

    const outerR = Math.min(w, h) * 0.28;
    const eventR = outerR * 0.27;
    const diskR = outerR * 0.55;

    // Soft lensing glow
    const glow = ctx.createRadialGradient(blackHole.x, blackHole.y, eventR * 0.2, blackHole.x, blackHole.y, outerR);
    glow.addColorStop(0, 'rgba(0,0,0,0.90)');
    glow.addColorStop(0.35, 'rgba(0,0,0,0.65)');
    glow.addColorStop(0.62, 'rgba(255,255,255,0.08)');
    glow.addColorStop(0.8, 'rgba(255,255,255,0.03)');
    glow.addColorStop(1, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Accretion disk (tilted, with brightness gradient so it doesn't look like an LED ring)
    ctx.save();
    ctx.globalAlpha = 0.55;
    const disk = ctx.createLinearGradient(
      blackHole.x - diskR * 1.6,
      blackHole.y,
      blackHole.x + diskR * 1.6,
      blackHole.y
    );
    disk.addColorStop(0, 'rgba(59, 130, 246, 0.00)');
    disk.addColorStop(0.26, 'rgba(59, 130, 246, 0.06)');
    disk.addColorStop(0.45, 'rgba(59, 130, 246, 0.22)');
    disk.addColorStop(0.55, 'rgba(255, 255, 255, 0.10)');
    disk.addColorStop(0.74, 'rgba(59, 130, 246, 0.08)');
    disk.addColorStop(1, 'rgba(59, 130, 246, 0.00)');
    ctx.fillStyle = disk;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.22)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(blackHole.x, blackHole.y - eventR * 0.06, diskR * 1.15, diskR * 0.42, -0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Photon ring (near the event horizon)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(128, 81, 81, 0.28)';
    ctx.shadowColor = 'rgba(59, 130, 246, 0.22)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(blackHole.x, blackHole.y, eventR * 1.08, eventR * 0.78, -0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Event horizon
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    ctx.beginPath();
    ctx.arc(blackHole.x, blackHole.y, eventR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawSpacetimeGrid = () => {
    if (!running) return;
    
    if (!ctx) return;

    const spacing = 70;
    const seg = 36;
    const pad = 120;
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let y0 = -pad; y0 <= h + pad; y0 += spacing) {
      ctx.beginPath();
      for (let i = 0; i <= seg; i += 1) {
        const x0 = -pad + ((w + pad * 2) * i) / seg;
        const p = warpPoint(x0, y0);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Vertical lines
    for (let x0 = -pad; x0 <= w + pad; x0 += spacing) {
      ctx.beginPath();
      for (let i = 0; i <= seg; i += 1) {
        const y0 = -pad + ((h + pad * 2) * i) / seg;
        const p = warpPoint(x0, y0);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawEquations = (dt) => {
    if (!running) return;

    if (!ctx) return;

    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.rot += n.vr * dt;
      }

      if (n.x < -0.25) n.x = 1.25;
      if (n.x > 1.25) n.x = -0.25;
      if (n.y > 1.25) {
        n.y = -0.25;
        n.text = equations[Math.floor(Math.random() * equations.length)];
        n.size = rand(12, 18);
        n.alpha = rand(0.18, 0.36);
        n.tint = Math.random() < 0.22;
        n.vx = rand(-0.014, 0.014);
        n.vy = rand(0.004, 0.02);
      }

      const px = n.x * w;
      const py = n.y * h;
      const wp = warpPoint(px, py);

      ctx.save();
      ctx.translate(wp.x, wp.y);
      ctx.rotate(n.rot);
      ctx.globalAlpha = n.alpha;
      ctx.fillStyle = n.tint ? 'rgba(59, 130, 246, 0.55)' : 'rgba(255, 255, 255, 0.48)';
      ctx.font = `${Math.round(n.size)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      ctx.fillText(n.text, 0, 0);
      ctx.restore();
    }
  };

  const resize = () => {
    const rect = equationBg.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    equationBg.width = Math.floor(w * dpr);
    equationBg.height = Math.floor(h * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    blackHole.x = w * 0.56;
    blackHole.y = h * 0.46;
    pointer.x = clamp(pointer.x || w * 0.25, 0, w);
    pointer.y = clamp(pointer.y || h * 0.65, 0, h);
    pointer.tx = clamp(pointer.tx || pointer.x, 0, w);
    pointer.ty = clamp(pointer.ty || pointer.y, 0, h);
  };

  const render = (t) => {    
    if (!ctx) return;

    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;

    if (pointer.active) {
      const ease = reduceMotion ? 0.12 : 0.065;
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
    }

    ctx.clearRect(0, 0, w, h);

    // Scene order: grid (space), black hole (lens), equations (floating details)
    drawSpacetimeGrid();
    drawBlackHole();
    drawEquations(dt);
  };

  const step = (t) => {
    render(t);
    raf = window.requestAnimationFrame(step);
  };

  const start = () => {
    window.cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    resize();
    if (!ctx) return;
    if (reduceMotion) {
      render(performance.now());
      return;
    }
    raf = window.requestAnimationFrame(step);
  };

  const stop = () => {
    window.cancelAnimationFrame(raf);
    raf = 0;
  };

  window.addEventListener('resize', () => {
    resize();
  });

  // Cursor interaction (gentle)
  window.addEventListener('mousemove', (e) => {
    const rect = equationBg.getBoundingClientRect();
    pointer.active = true;
    pointer.tx = clamp(e.clientX - rect.left, 0, w);
    pointer.ty = clamp(e.clientY - rect.top, 0, h);
  });
  window.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
  start();
}
