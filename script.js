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
