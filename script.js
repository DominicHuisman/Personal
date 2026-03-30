/* ============================================
   NEXUS DIGITAL — SMOOTH EXPERIENCE ENGINE
   ============================================ */
(function () {
  'use strict';

  /* ----- GLOBALS ----- */
  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');
  const body    = document.body;

  let current  = 0;   // lerp'd scroll position
  let target   = 0;   // actual scroll position
  const ease   = 0.075;
  let raf;
  let wh = window.innerHeight;
  let ww = window.innerWidth;

  /* ----- RESIZE UTILITY ----- */
  function setBodyHeight() {
    body.style.height = content.scrollHeight + 'px';
  }

  /* ----- SMOOTH SCROLL LOOP ----- */
  function smoothScroll() {
    target = window.scrollY;
    current += (target - current) * ease;
    // snap precision
    if (Math.abs(target - current) < 0.5) current = target;
    content.style.transform = 'translate3d(0,' + (-current) + 'px,0)';
    // gradient text scroll color
    updateGradientText();
    // parallax
    updateParallax();
    // rocket zoom
    updateRocket();
    raf = requestAnimationFrame(smoothScroll);
  }

  /* ----- MOUSE-DRIVEN GRADIENT TEXT ----- */
  var gradientEls = [];
  var mouseXTarget = 0;
  var hueSmooth = 260; // starting hue
  var hueLerp = 0.02;  // very slow blend

  function initGradientText() {
    gradientEls = document.querySelectorAll('.gradient-text');
    document.addEventListener('mousemove', function (e) {
      mouseXTarget = e.clientX / ww;  // 0 → 1
    });
  }

  function updateGradientText() {
    if (!gradientEls.length) return;
    // map mouse X to hue range: 220 (blue) → 280 (purple)
    var targetHue = 220 + mouseXTarget * 60;
    hueSmooth += (targetHue - hueSmooth) * hueLerp;
    for (var i = 0; i < gradientEls.length; i++) {
      gradientEls[i].style.setProperty('--hue', hueSmooth);
    }
  }

  /* ----- PARALLAX ----- */
  const parallaxEls = [];

  function cacheParallax() {
    parallaxEls.length = 0;
    document.querySelectorAll('[data-speed]').forEach(function (el) {
      parallaxEls.push({
        el: el,
        speed: parseFloat(el.dataset.speed),
        top: 0
      });
    });
    recalcParallax();
  }

  function recalcParallax() {
    parallaxEls.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();
      item.top = rect.top + current;
    });
  }

  function updateParallax() {
    parallaxEls.forEach(function (item) {
      var offset = (current - item.top + wh) * item.speed;
      item.el.style.transform = 'translate3d(0,' + offset + 'px,0)';
    });
  }

  /* ----- REVEAL ON SCROLL ----- */
  function initReveals() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.delay || 0;
          if (delay > 0) {
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, delay * 1000);
          } else {
            entry.target.classList.add('visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '-40px 0px', threshold: 0.15 });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ----- LINE REVEALS ----- */
  function initLineReveals() {
    var containers = document.querySelectorAll('.hero__title, .big-cta__title');
    if (!containers.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('lines-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '-20px 0px', threshold: 0.2 });

    containers.forEach(function (el) { observer.observe(el); });
  }

  /* ----- ROCKET INTRO ----- */
  var rocketSvg, rocketHint, rocketSection, rocketZoneEnd;

  function initRocket() {
    rocketSvg     = document.getElementById('rocketSvg');
    rocketHint    = document.querySelector('.rocket-intro__hint');
    rocketSection = document.getElementById('rocketIntro');
    if (!rocketSection) return;
    rocketZoneEnd = rocketSection.offsetHeight - wh;
  }

  function updateRocket() {
    if (!rocketSvg || !rocketSection) return;
    // progress 0→1 through the rocket section (300vh minus one screen)
    var progress = current / rocketZoneEnd;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Scale: 1 → 50  (exponential for dramatic zoom)
    var scale = 1 + Math.pow(progress, 2.5) * 49;
    // Opacity: visible until very end, then fade out
    var opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
    // Flames grow
    var flameScale = 1 + progress * 2;

    rocketSvg.style.transform = 'scale(' + scale + ')';
    rocketSvg.style.opacity = opacity;

    // Flame intensity via filter glow
    var glowSize = 40 + progress * 120;
    rocketSvg.style.filter = 'drop-shadow(0 0 ' + glowSize + 'px rgba(108,92,231,' + (0.2 + progress * 0.6) + '))';

    // Scale flames
    var flames = rocketSection.querySelectorAll('.rocket__flame');
    flames.forEach(function(f) {
      f.style.transform = 'scaleY(' + flameScale + ')';
    });

    // Hide hint as soon as scrolling starts
    if (rocketHint) {
      rocketHint.style.opacity = progress > 0.05 ? '0' : '1';
    }

    // Hide nav until rocket section is passed
    var nav = document.getElementById('nav');
    if (nav) {
      nav.style.opacity = progress < 0.95 ? '0' : '1';
      nav.style.pointerEvents = progress < 0.95 ? 'none' : '';
    }
  }

  /* ----- HERO ACTIVATE ----- */
  function initHero() {
    var hero = document.querySelector('.hero');
    if (hero) {
      setTimeout(function () { hero.classList.add('is-active'); }, 600);
    }
  }

  /* ----- STARFIELD CANVAS ----- */
  function initStarfield() {
    var canvas = document.getElementById('starfield');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [];
    var count = 350;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.3,
          a: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    var frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.a + Math.sin(frame * s.pulse + s.phase) * 0.15;
        if (alpha < 0) alpha = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', function () {
      resize();
      createStars();
    });
  }

  /* ----- CUSTOM CURSOR ----- */
  function initCursor() {
    if (ww < 769) return;
    var cursor = document.getElementById('cursor');
    var label  = document.getElementById('cursorLabel');
    if (!cursor) return;

    var mx = 0, my = 0;
    var cx = 0, cy = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    }
    loop();

    // hover states
    var hovers = document.querySelectorAll('a, button, .service-row, .work__card');
    hovers.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        body.classList.add('cursor-hover');
        var text = el.dataset.cursorText;
        if (text && label) {
          label.textContent = text;
          body.classList.add('cursor-text');
        }
      });
      el.addEventListener('mouseleave', function () {
        body.classList.remove('cursor-hover', 'cursor-text');
        if (label) label.textContent = '';
      });
    });
  }

  /* ----- NAVIGATION ----- */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var links  = document.getElementById('navLinks');

    // scrolled state — check against lerp'd value
    function checkScroll() {
      if (current > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      requestAnimationFrame(checkScroll);
    }
    checkScroll();

    // mobile toggle
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }
  }

  /* ----- SMOOTH ANCHOR LINKS ----- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#') return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        // calculate position inside smooth-content
        var rect = el.getBoundingClientRect();
        var scrollTo = rect.top + current - 80;
        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      });
    });
  }

  /* ----- PRELOADER ----- */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var fill      = document.getElementById('preloaderFill');
    if (!preloader || !fill) return;

    var progress = 0;
    var interval = setInterval(function () {
      progress += Math.random() * 20 + 10;
      if (progress > 100) progress = 100;
      fill.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(function () {
          preloader.classList.add('done');
          // recalc after fonts/images settle
          setTimeout(function () {
            setBodyHeight();
            cacheParallax();
          }, 300);
        }, 400);
      }
    }, 150);
  }

  /* ----- TEXT SCRAMBLE HOVER ----- */
  function initScramble() {
    var chars = '{}<>/\\01!@#$%^&*_-+=|;:?~';
    var selector = '.nav__links a:not(.nav__cta), .footer__nav a, .tag, .work__tag, .pillar__num, .service-row__num, .pricing__tier, .footer__social a';
    var targets = document.querySelectorAll(selector);

    targets.forEach(function (el) {
      var original = el.textContent;
      var scrambleTimer = null;

      el.addEventListener('mouseenter', function () {
        if (scrambleTimer) return;
        el.classList.add('scrambling');
        var iteration = 0;
        var len = original.length;
        scrambleTimer = setInterval(function () {
          var text = '';
          for (var i = 0; i < len; i++) {
            if (i < iteration) {
              text += original[i];
            } else {
              text += chars[Math.floor(Math.random() * chars.length)];
            }
          }
          el.textContent = text;
          iteration += 1 / 2;
          if (iteration >= len) {
            clearInterval(scrambleTimer);
            scrambleTimer = null;
            el.textContent = original;
            el.classList.remove('scrambling');
          }
        }, 30);
      });

      el.addEventListener('mouseleave', function () {
        if (scrambleTimer) {
          clearInterval(scrambleTimer);
          scrambleTimer = null;
        }
        el.textContent = original;
        el.classList.remove('scrambling');
      });
    });
  }

  /* ----- CONTACT FORM ----- */
  function initForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Message Sent ✓';
      btn.style.pointerEvents = 'none';
      btn.style.background = 'rgba(108,92,231,0.2)';
      setTimeout(function () {
        form.reset();
        btn.innerHTML = 'Send Message <span class="btn__arrow">&rarr;</span>';
        btn.style.pointerEvents = '';
        btn.style.background = '';
      }, 3000);
    });
  }

  /* ----- INIT ----- */
  function init() {
    // enable smooth scroll: fix body, overflow handled by CSS
    body.style.overflow = 'visible';    // allow native scroll for the height
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.overflow = 'hidden';

    setBodyHeight();
    cacheParallax();
    initGradientText();
    smoothScroll();

    initRocket();
    initReveals();
    initLineReveals();
    initHero();
    initStarfield();
    initCursor();
    initNav();
    initAnchors();
    initForm();
    initScramble();
    initPreloader();

    // recalc on resize
    window.addEventListener('resize', function () {
      wh = window.innerHeight;
      ww = window.innerWidth;
      setBodyHeight();
      cacheParallax();
      if (rocketSection) rocketZoneEnd = rocketSection.offsetHeight - wh;
    });
  }

  // wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
