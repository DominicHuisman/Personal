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
  const scrubSection = document.getElementById('scrollStatement');
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

    // Scroll-scrubbed text reveal (champions4good style)
    if (scrubSection && scrubLines.length) {
      var sTop = scrubSection.offsetTop;
      var scrollStart = sTop - wh;
      var scrollEnd = sTop - wh * 0.2;
      var sp = Math.max(0, Math.min(1, (current - scrollStart) / (scrollEnd - scrollStart)));

      scrubLines.forEach(function(line, li) {
        var lineStart = li * 0.12;
        var isGradient = line.classList.contains('scrub-line--gradient');

        if (isGradient) {
          // Animate gradient line as one unit
          var lEnd = lineStart + 0.55;
          var lp = Math.max(0, Math.min(1, (sp - lineStart) / (lEnd - lineStart)));
          var eased = 1 - Math.pow(1 - lp, 3);
          var lx = 80 * (1 - eased);
          var lSkew = -14 * (1 - eased);
          line.style.transform = 'translateX(' + lx + 'px) skewX(' + lSkew + 'deg)';
          line.style.opacity = Math.min(1, lp * 2.5);
        } else {
          var chars = line._chars;
          if (!chars || !chars.length) return;
          for (var ci = 0; ci < chars.length; ci++) {
            var charStart = lineStart + (ci / chars.length) * 0.15;
            var charEnd = charStart + 0.5;
            var cp = Math.max(0, Math.min(1, (sp - charStart) / (charEnd - charStart)));
            var e3 = 1 - Math.pow(1 - cp, 3);
            var cx = 80 * (1 - e3);
            var cSkew = -14 * (1 - e3);
            var cScaleY = 0.95 + 0.05 * e3;
            var cOpacity = Math.min(1, cp * 2.5);
            chars[ci].style.transform = 'translateX(' + cx + 'px) skewX(' + cSkew + 'deg) scaleY(' + cScaleY + ')';
            chars[ci].style.opacity = cOpacity;
          }
        }
      });

      // Sticker reveals
      scrubStickers.forEach(function(sticker, i) {
        var sDelay = 0.35 + i * 0.15;
        var stP = Math.max(0, Math.min(1, (sp - sDelay) / 0.4));
        var sEased = 1 - Math.pow(1 - stP, 3);
        var rotY = -40 * (1 - sEased);
        var sScale = 1.35 - 0.35 * sEased;
        sticker.style.transform = 'perspective(1000px) rotateY(' + rotY + 'deg) scale(' + sScale + ')';
        sticker.style.opacity = sEased;
      });
    }

    requestAnimationFrame(smoothScroll);
  }

  /* ---------- Parallax ---------- */
  let parallaxEls = [];
  let scrubLines = [];
  let scrubStickers = [];

  /* ---------- Scroll-scrubbed text splitting ---------- */
  function initScrubText() {
    var lines = document.querySelectorAll('[data-scrub-line]');
    scrubLines = [];
    lines.forEach(function(line) {
      // Don't split gradient lines (animate as unit)
      if (line.classList.contains('scrub-line--gradient')) {
        line._chars = null;
        scrubLines.push(line);
        return;
      }
      var text = line.textContent;
      var html = '';
      for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          html += '<span class="scrub-char">\u00A0</span>';
        } else {
          html += '<span class="scrub-char">' + text[i] + '</span>';
        }
      }
      line.innerHTML = html;
      line._chars = line.querySelectorAll('.scrub-char');
      scrubLines.push(line);
    });
    scrubStickers = document.querySelectorAll('[data-scroll-sticker]');
  }

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
    initScrubText();
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
