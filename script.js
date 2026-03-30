/* ============================================
   NEXUS DIGITAL — INTERACTIONS & ENGINE
   ============================================ */

(function () {
  'use strict';

  /* ---------- Preloader ---------- */
  const preloader = document.querySelector('.preloader');
  const preloaderFill = document.querySelector('.preloader__fill');
  let loadProgress = 0;

  function advanceLoader() {
    loadProgress += Math.random() * 20 + 10;
    if (loadProgress > 100) loadProgress = 100;
    if (preloaderFill) preloaderFill.style.width = loadProgress + '%';
    if (loadProgress < 100) requestAnimationFrame(advanceLoader);
  }
  advanceLoader();

  window.addEventListener('load', () => {
    if (preloaderFill) preloaderFill.style.width = '100%';
    setTimeout(() => {
      if (preloader) preloader.classList.add('done');
      document.body.style.overflow = '';
      initAfterLoad();
    }, 600);
  });

  /* ---------- DOM ---------- */
  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const zoomSection = document.querySelector('.zoom-intro');
  const zoomText = document.getElementById('zoomText');
  const zoomHint = document.getElementById('zoomHint');
  const rocketRide = document.getElementById('rocketRide');
  const rocketShip = document.getElementById('rocketShip');
  const starCanvas = document.getElementById('starfield');
  const ctx = starCanvas ? starCanvas.getContext('2d') : null;

  /* ---------- State ---------- */
  let current = 0, target = 0, ease = 0.075;
  let wh = window.innerHeight;
  let ww = window.innerWidth;
  let contentH = 0;

  /* ---------- Smooth Scroll Engine ---------- */
  function setBodyHeight() {
    contentH = content.scrollHeight;
    document.body.style.height = contentH + 'px';
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function smoothScroll() {
    target = window.scrollY;
    current = lerp(current, target, ease);
    if (Math.abs(current - target) < 0.5) current = target;
    content.style.transform = 'translate3d(0,' + -current + 'px,0)';

    // Parallax
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const rect = el.getBoundingClientRect();
      const y = (rect.top + rect.height / 2 - wh / 2) * speed;
      el.style.transform = 'translate3d(0,' + y + 'px,0)';
    });

    // Text zoom intro
    if (zoomSection && zoomText) {
      const zTop = zoomSection.offsetTop;
      const zH = zoomSection.offsetHeight - wh;
      const p = Math.max(0, Math.min(1, (current - zTop) / zH));
      const scale = 1 + p * p * 30;
      const opacity = p > 0.4 ? 1 - ((p - 0.4) / 0.4) : 1;
      zoomText.style.transform = 'scale(' + scale + ')';
      zoomText.style.opacity = Math.max(0, opacity);
      if (zoomHint) zoomHint.style.opacity = p > 0.08 ? 0 : 1;
      if (nav) nav.style.opacity = p > 0.05 ? 0 : 1;
    }

    // Gradient text hue (mouse-driven, see mousemove)
    updateGradientHue();

    // Rocket ride — fixed element flying diagonally across viewport
    if (rocketRide && rocketShip) {
      var rTop = rocketRide.offsetTop;
      var rH = rocketRide.offsetHeight - wh;
      var rp = Math.max(0, Math.min(1, (current - rTop) / rH));

      if (rp > 0 && rp < 1) {
        // Cubic ease-in-out
        var ep = rp < 0.5
          ? 4 * rp * rp * rp
          : 1 - Math.pow(-2 * rp + 2, 3) / 2;

        // Viewport-relative path: bottom-right corner to top-left corner
        // Start off-screen bottom-right, end off-screen top-left
        var rx = ww * (1.1 - 1.3 * ep);
        var ry = wh * (1.15 - 1.4 * ep);

        // Fade: appear quickly, stay visible, fade out at end
        var opacity = 1;
        if (rp < 0.1) opacity = rp / 0.1;
        else if (rp > 0.85) opacity = (1 - rp) / 0.15;

        // Rotation: tilted to match diagonal flight path (nose pointing up-left)
        var angle = -35;

        rocketShip.style.left = rx + 'px';
        rocketShip.style.top = ry + 'px';
        rocketShip.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg)';
        rocketShip.style.opacity = opacity;
      } else {
        rocketShip.style.opacity = 0;
      }
    }

    requestAnimationFrame(smoothScroll);
  }

  /* ---------- Parallax ---------- */
  let parallaxEls = [];

  /* ---------- Mouse-driven gradient hue ---------- */
  let mouseX = 0.5, mouseY = 0.5;
  let hueTarget = 250, hueCurrent = 250;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX / ww;
    mouseY = e.clientY / wh;
  });

  function updateGradientHue() {
    hueTarget = 220 + mouseX * 60; // 220-280 range
    hueCurrent = lerp(hueCurrent, hueTarget, 0.02);
    document.querySelectorAll('.gradient-text').forEach(el => {
      el.style.setProperty('--hue', hueCurrent);
    });
  }

  /* ---------- Custom Cursor ---------- */
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor__dot');
  const cursorRing = document.querySelector('.cursor__ring');
  const cursorLabel = document.querySelector('.cursor__label');
  let cx = 0, cy = 0, cxTarget = 0, cyTarget = 0;

  function initCursor() {
    if (!cursor || ww < 769) return;

    document.addEventListener('mousemove', e => {
      cxTarget = e.clientX;
      cyTarget = e.clientY;
    });

    // Hover targets
    const hoverables = document.querySelectorAll('a, button, .btn, .work__card, .diff__card, .feature, .package, .process__step');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        const txt = el.dataset.cursorText;
        if (txt && cursorLabel) {
          cursorLabel.textContent = txt;
          document.body.classList.add('cursor-text');
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover', 'cursor-text');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });

    function animateCursor() {
      cx = lerp(cx, cxTarget, 0.15);
      cy = lerp(cy, cyTarget, 0.15);
      if (cursor) cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ---------- Starfield ---------- */
  let stars = [];
  const STAR_COUNT = 350;

  function initStarfield() {
    if (!starCanvas || !ctx) return;
    resizeCanvas();
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * ww,
        y: Math.random() * wh,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.1,
        s: Math.random() * 0.5 + 0.1,
        d: Math.random() * Math.PI * 2,
      });
    }
    animateStars();
  }

  function resizeCanvas() {
    if (!starCanvas) return;
    starCanvas.width = ww;
    starCanvas.height = wh;
  }

  function animateStars() {
    if (!ctx) return;
    ctx.clearRect(0, 0, ww, wh);
    const time = Date.now() * 0.001;
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * s.s + s.d);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,200,255,' + (s.a * twinkle) + ')';
      ctx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    const reveals = document.querySelectorAll('.reveal');
    const lines = document.querySelectorAll('[data-lines]');

    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.delay) || 0;
          setTimeout(() => e.target.classList.add('visible'), delay);
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObs.observe(el));

    const lineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('lines-visible');
          lineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    lines.forEach(el => lineObs.observe(el));

    // Hero activation
    if (hero) {
      setTimeout(() => hero.classList.add('is-active'), 800);
    }
  }

  /* ---------- Nav ---------- */
  function initNav() {
    if (!nav) return;

    // Scroll state
    const scrollCheck = () => {
      if (target > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', scrollCheck, { passive: true });

    // Mobile toggle
    const toggle = nav.querySelector('.nav__toggle');
    const links = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }
  }

  /* ---------- Smooth Anchors ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const id = a.getAttribute('href');
        if (id === '#') return;
        const el = document.querySelector(id);
        if (!el) return;
        const top = el.offsetTop;
        window.scrollTo({ top, behavior: 'auto' });
        target = top;
      });
    });
  }

  /* ---------- Text Scramble ---------- */
  const CHARS = '{}/<>01!@#$%^&*()_+~`|\\:;"\',.?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  function scramble(el) {
    const original = el.dataset.text || el.textContent;
    if (!el.dataset.text) el.dataset.text = original;
    const len = original.length;
    let frame = 0;
    const totalFrames = 12;

    function step() {
      let out = '';
      for (let i = 0; i < len; i++) {
        if (original[i] === ' ') { out += ' '; continue; }
        if (frame > (i / len) * totalFrames) {
          out += original[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(step);
      else el.textContent = original;
    }
    el.classList.add('scrambling');
    step();
    setTimeout(() => el.classList.remove('scrambling'), totalFrames * 30);
  }

  function initScramble() {
    const targets = document.querySelectorAll(
      '.nav__links a:not(.nav__cta), .footer__nav a, .tag, .work__cat, .diff__num, .process__num, .package__tier, .footer__social a'
    );
    targets.forEach(t => {
      t.addEventListener('mouseenter', () => scramble(t));
    });
  }

  /* ---------- Contact Form ---------- */
  function initForm() {
    const form = document.querySelector('.contact__form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn');
      if (btn) {
        btn.textContent = 'Message Sent';
        btn.style.background = '#00b894';
      }
      setTimeout(() => {
        form.reset();
        if (btn) {
          btn.innerHTML = 'Send Message <span class="btn__arrow">&rarr;</span>';
          btn.style.background = '';
        }
      }, 3000);
    });
  }

  /* ---------- Init ---------- */
  function initAfterLoad() {
    parallaxEls = document.querySelectorAll('[data-speed]');
    setBodyHeight();
    smoothScroll();
    initStarfield();
    initCursor();
    initReveals();
    initNav();
    initAnchors();
    initScramble();
    initForm();
  }

  /* ---------- Resize ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      wh = window.innerHeight;
      ww = window.innerWidth;
      setBodyHeight();
      resizeCanvas();
    }, 150);
  });
})();
