import Reveal from 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.esm.js';
import RevealNotes from 'https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.esm.js';

// ============================================
// Botanical Floating Elements
// Soft leaves, geometric blocks, organic shapes
// ============================================

const GREENS = [
  { r: 92, g: 107, b: 79 },   // sage
  { r: 139, g: 157, b: 119 }, // light sage
  { r: 197, g: 209, b: 184 }, // pale
  { r: 74, g: 93, b: 62 },    // olive
  { r: 60, g: 74, b: 60 },    // dark forest
  { r: 170, g: 184, b: 155 }, // muted green
];

class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.elements = [];
    this.running = false;
    this.time = 0;
    this.w = 0;
    this.h = 0;
  }

  setup() {
    this.resize();
    this.initElements();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.w = rect.width;
    this.h = rect.height;
  }

  initElements() {
    this.elements = [];
    const count = Math.min(40, Math.floor((this.w * this.h) / 25000));
    for (let i = 0; i < count; i++) {
      const color = GREENS[Math.floor(Math.random() * GREENS.length)];
      const type = Math.random();
      let shape;
      if (type < 0.4) shape = 'leaf';
      else if (type < 0.7) shape = 'circle';
      else shape = 'rect';

      this.elements.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 8 + Math.random() * 30,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.15,
        alpha: 0.04 + Math.random() * 0.08,
        color,
        shape,
        phase: Math.random() * Math.PI * 2,
        drift: 0.3 + Math.random() * 0.5,
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.animate();
  }

  stop() {
    this.running = false;
  }

  animate() {
    if (!this.running) return;
    this.time += 0.008;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  update() {
    for (const el of this.elements) {
      el.x += el.vx + Math.sin(this.time + el.phase) * el.drift * 0.15;
      el.y += el.vy;
      el.rotation += el.rotSpeed;

      if (el.y < -el.size * 2) {
        el.y = this.h + el.size * 2;
        el.x = Math.random() * this.w;
      }
      if (el.x < -el.size * 2) el.x = this.w + el.size;
      if (el.x > this.w + el.size * 2) el.x = -el.size;
    }
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    for (const el of this.elements) {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.globalAlpha = el.alpha;

      const { r, g, b } = el.color;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      if (el.shape === 'leaf') {
        this.drawLeaf(ctx, el.size);
      } else if (el.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, el.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-el.size * 0.4, -el.size * 0.4, el.size * 0.8, el.size * 0.8);
      }

      ctx.restore();
    }
  }

  drawLeaf(ctx, size) {
    const s = size * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.6, s * 0.3, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.8, -s * 0.6, 0, -s);
    ctx.fill();
  }
}

// ============================================
// Reveal.js Initialization
// ============================================

const deck = Reveal({
  width: 1920,
  height: 1080,
  margin: 0.06,
  minScale: 0.2,
  maxScale: 2.0,
  hash: true,
  hashOneBasedIndex: true,
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  slideNumber: false,
  showSlideNumber: 'none',
  controls: false,
  controlsTutorial: false,
  progress: false,
  center: true,
  touch: true,
  keyboard: true,
  overview: true,
  fragments: false,
  plugins: [RevealNotes],
});

deck.initialize().then(() => {
  // Setup particle backgrounds
  const titleCanvas = document.getElementById('title-particles');
  const endingCanvas = document.getElementById('ending-particles');

  const titleNet = titleCanvas ? new ParticleNetwork(titleCanvas) : null;
  const endingNet = endingCanvas ? new ParticleNetwork(endingCanvas) : null;

  if (titleNet) {
    titleNet.setup();
    titleNet.start();
  }

  if (endingNet) {
    endingNet.setup();
  }

  // iframe lazy loading
  function loadIframes(slideEl) {
    if (!slideEl) return;
    const iframes = slideEl.querySelectorAll('iframe[data-src]');
    iframes.forEach((iframe) => {
      if (!iframe.src || iframe.src === 'about:blank') {
        iframe.src = iframe.dataset.src;
      }
    });
  }

  function unloadIframes(slideEl) {
    if (!slideEl) return;
    const iframes = slideEl.querySelectorAll('iframe[data-src]');
    iframes.forEach((iframe) => {
      iframe.src = 'about:blank';
    });
  }

  // Sequential auto-animation
  function animateSeqElements(slideEl) {
    if (!slideEl) return;
    const seqs = slideEl.querySelectorAll('.seq');
    seqs.forEach((el) => el.classList.remove('seq-visible'));
    seqs.forEach((el, i) => {
      setTimeout(() => el.classList.add('seq-visible'), 120 * (i + 1));
    });
  }

  // Pagination
  function buildPagination() {
    const topSections = document.querySelectorAll('.reveal .slides > section');
    const totalSlides = topSections.length;
    const subCounts = [];
    topSections.forEach((sec) => {
      const nested = sec.querySelectorAll(':scope > section');
      subCounts.push(nested.length > 0 ? nested.length : 0);
    });

    const nav = document.createElement('nav');
    nav.className = 'slide-pagination';

    // Main row: ◀ dots ▶ counter
    const mainRow = document.createElement('div');
    mainRow.className = 'main-row';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-btn';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const idx = deck.getIndices();
      if (idx.v > 0) {
        deck.slide(idx.h, idx.v - 1);
      } else if (idx.h > 0) {
        // Go to last vertical of previous section
        const prevSub = subCounts[idx.h - 1];
        deck.slide(idx.h - 1, prevSub > 0 ? prevSub - 1 : 0);
      }
    });

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots-wrap';
    topSections.forEach((sec, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      if (subCounts[i] > 0) dot.classList.add('has-sub');
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        deck.slide(i, 0);
      });
      dotsWrap.appendChild(dot);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const idx = deck.getIndices();
      const currentSub = subCounts[idx.h];
      if (currentSub > 0 && idx.v < currentSub - 1) {
        deck.slide(idx.h, idx.v + 1);
      } else if (idx.h < totalSlides - 1) {
        deck.slide(idx.h + 1, 0);
      }
    });

    const counter = document.createElement('div');
    counter.className = 'slide-counter';

    mainRow.appendChild(prevBtn);
    mainRow.appendChild(dotsWrap);
    mainRow.appendChild(nextBtn);
    mainRow.appendChild(counter);
    nav.appendChild(mainRow);

    // Sub row (for vertical slides)
    const subRow = document.createElement('div');
    subRow.className = 'sub-row';
    nav.appendChild(subRow);

    nav.addEventListener('click', (e) => e.stopPropagation());
    nav.addEventListener('mousedown', (e) => e.stopPropagation());
    nav.addEventListener('pointerdown', (e) => e.stopPropagation());
    document.body.appendChild(nav);
    console.log('Pagination — totalSlides:', totalSlides, 'subCounts:', subCounts);
    return { nav, counter, subRow, totalSlides, subCounts };
  }

  const { nav: pagination, counter: pageCounter, subRow, totalSlides, subCounts } = buildPagination();

  function updatePagination(indexh, indexv) {
    // Main dots
    const dots = pagination.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === indexh));

    // Counter
    pageCounter.textContent = `${indexh + 1} / ${totalSlides}`;

    // Sub row
    subRow.innerHTML = '';
    if (subCounts[indexh] > 0) {
      subRow.classList.add('visible');
      for (let v = 0; v < subCounts[indexh]; v++) {
        const sub = document.createElement('button');
        sub.className = 'sub-dot';
        if (v === indexv) sub.classList.add('active');
        sub.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          deck.slide(indexh, v);
        });
        subRow.appendChild(sub);
      }
    } else {
      subRow.classList.remove('visible');
    }
  }

  // Initial state - use current indices (supports hash-based reload)
  const initIdx = deck.getIndices();
  updatePagination(initIdx.h, initIdx.v || 0);
  animateSeqElements(deck.getCurrentSlide());
  loadIframes(deck.getCurrentSlide());

  // Manage particle animations, iframes, seq animations, pagination
  deck.on('slidechanged', (event) => {
    console.log('slidechanged — h:', event.indexh, 'v:', event.indexv, 'subCounts[h]:', subCounts[event.indexh]);
    // Title slide (index 0, 0)
    if (event.indexh === 0 && event.indexv === 0) {
      titleNet?.start();
    } else {
      titleNet?.stop();
    }

    // Ending slide
    if (endingNet) {
      const slides = document.querySelectorAll('.reveal .slides > section');
      const lastIndex = slides.length - 1;
      if (event.indexh === lastIndex) {
        endingNet.resize();
        endingNet.initElements();
        endingNet.start();
      } else {
        endingNet.stop();
      }
    }

    // Lazy load iframes on current slide
    loadIframes(event.currentSlide);

    // Unload iframes on previous slide to save resources
    if (event.previousSlide) {
      unloadIframes(event.previousSlide);
    }

    // Sequential auto-animation
    animateSeqElements(event.currentSlide);

    // Pagination
    updatePagination(event.indexh, event.indexv ?? 0);
  });

  // Handle resize
  window.addEventListener('resize', () => {
    if (titleNet) {
      titleNet.resize();
      titleNet.initElements();
    }
    if (endingNet) {
      endingNet.resize();
      endingNet.initElements();
    }
  });
});
