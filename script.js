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

  window.addEventListener('load', function() {
    if (preloaderFill) preloaderFill.style.width = '100%';
    setTimeout(function() {
      if (preloader) preloader.classList.add('done');
      document.body.style.overflow = '';
      initAfterLoad();
    }, 600);
  });

  /* ---------- DOM ---------- */
  var wrapper = document.getElementById('smooth-wrapper');
  var content = document.getElementById('smooth-content');
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  var zoomSection = document.querySelector('.zoom-intro');
  var zoomText = document.getElementById('zoomText');
  var zoomHint = document.getElementById('zoomHint');
  var scrubSection = document.getElementById('scrollStatement');
  var starCanvas = document.getElementById('starfield');
  var ctx = starCanvas ? starCanvas.getContext('2d') : null;

  /* ---------- State ---------- */
  var current = 0, target = 0, ease = 0.075;
  var wh = window.innerHeight;
  var ww = window.innerWidth;
  var contentH = 0;

  /* ---------- Animation Elements ---------- */
  var scrollCards = [];
  var scrollSlides = [];
  var scrollFadeUps = [];
  var splitWordSections = [];
  var parallaxEls = [];
  var scrubLines = [];
  var scrubStickers = [];
  var stackCards = [];
  var stackCardTops = [];
  var stackSectionTop = 0;
  var showcaseText = null;
  var showcaseMockup = null;
  var showcaseSection = null;
  var showcaseSectionTop = 0;

  /* ---------- Helpers ---------- */
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Walk up offsetParent chain to get true top relative to smooth-content
  function getOffsetTop(el) {
    var top = 0;
    var node = el;
    while (node && node !== content && node !== document.body) {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    return top;
  }

  /* ---------- Smooth Scroll Engine ---------- */
  function setBodyHeight() {
    contentH = content.scrollHeight;
    document.body.style.height = contentH + 'px';
  }

  function smoothScroll() {
    target = window.scrollY;
    current = lerp(current, target, ease);
    if (Math.abs(current - target) < 0.5) current = target;
    content.style.transform = 'translate3d(0,' + -current + 'px,0)';

    /* Parallax */
    for (var pi = 0; pi < parallaxEls.length; pi++) {
      var pel = parallaxEls[pi];
      var speed = parseFloat(pel.dataset.speed) || 0;
      var pTop = getOffsetTop(pel);
      var relY = pTop - current;
      var y = (relY + pel.offsetHeight / 2 - wh / 2) * speed;
      pel.style.transform = 'translate3d(0,' + y + 'px,0)';
    }

    /* Text zoom intro */
    if (zoomSection && zoomText) {
      var zTop = zoomSection.offsetTop;
      var zH = zoomSection.offsetHeight - wh;
      var zp = Math.max(0, Math.min(1, (current - zTop) / zH));
      var zScale = 1 + zp * zp * 30;
      var zOpacity = zp > 0.4 ? 1 - ((zp - 0.4) / 0.4) : 1;
      zoomText.style.transform = 'scale(' + zScale + ')';
      zoomText.style.opacity = Math.max(0, zOpacity);
      if (zoomHint) zoomHint.style.opacity = zp > 0.08 ? 0 : 1;
      if (nav) nav.style.opacity = zp > 0.05 ? 0 : 1;
    }

    /* Gradient hue */
    updateGradientHue();

    /* Scrub statement text */
    animateScrubText();

    /* ====== SCROLL-DRIVEN SECTION ANIMATIONS ====== */

    /* 1) Scroll fade-ups */
    for (var fi = 0; fi < scrollFadeUps.length; fi++) {
      var fu = scrollFadeUps[fi];
      if (current + wh * 0.82 > fu._top && !fu.classList.contains('in-view')) {
        fu.classList.add('in-view');
      }
    }

    /* 2) 3D card reveals */
    for (var ci = 0; ci < scrollCards.length; ci++) {
      var card = scrollCards[ci];
      var cStart = card._sectionTop - wh * 0.65;
      var cEnd = cStart + wh * 0.55;
      var cp = Math.max(0, Math.min(1, (current - cStart) / (cEnd - cStart)));
      var cDelay = card._idx * 0.15;
      var cDelayed = Math.max(0, Math.min(1, (cp - cDelay) / (1 - cDelay)));
      var cEased = 1 - Math.pow(1 - cDelayed, 3);

      card.style.transform = 'perspective(1200px) rotateY(' + (-8 * (1 - cEased)) +
        'deg) rotateX(' + (4 * (1 - cEased)) +
        'deg) translateY(' + (60 * (1 - cEased)) +
        'px) scale(' + (0.92 + 0.08 * cEased) + ')';
      card.style.opacity = Math.min(1, cDelayed * 2.5);
    }

    /* 3) Process step slides */
    for (var si = 0; si < scrollSlides.length; si++) {
      var slide = scrollSlides[si];
      var sStart = slide._sectionTop - wh * 0.55;
      var sEnd = sStart + wh * 0.65;
      var sp2 = Math.max(0, Math.min(1, (current - sStart) / (sEnd - sStart)));
      var sDelay2 = slide._idx * 0.18;
      var sDelayed = Math.max(0, Math.min(1, (sp2 - sDelay2) / (1 - sDelay2)));
      var sEased = 1 - Math.pow(1 - sDelayed, 4);

      slide.style.transform = 'translateX(' + (-100 * (1 - sEased)) + 'px)';
      slide.style.opacity = Math.min(1, sDelayed * 2);

      var sLine = slide.querySelector('.process__line');
      if (sLine) sLine.style.width = (sEased * 100) + '%';
    }

    /* 4) Split-word reveals */
    for (var wi2 = 0; wi2 < splitWordSections.length; wi2++) {
      var item = splitWordSections[wi2];
      var wStart = item.top - wh * 0.75;
      var wEnd = wStart + wh * 0.35;
      var wp2 = Math.max(0, Math.min(1, (current - wStart) / (wEnd - wStart)));

      for (var wj = 0; wj < item.words.length; wj++) {
        var wordDelay = (wj / item.words.length) * 0.5;
        var wwp = Math.max(0, Math.min(1, (wp2 - wordDelay) / (1 - wordDelay)));
        var wEased = 1 - Math.pow(1 - wwp, 3);
        item.words[wj].style.transform = 'translateY(' + (40 * (1 - wEased)) + 'px) rotateX(' + (-15 * (1 - wEased)) + 'deg)';
        item.words[wj].style.opacity = Math.min(1, wwp * 2);
      }
    }

    /* 5) Showcase — scroll-driven reveal */
    if (showcaseSection) {
      var scTop = showcaseSectionTop - wh * 0.75;
      var scP = Math.max(0, Math.min(1, (current - scTop) / (wh * 0.5)));
      if (scP > 0 && showcaseText && !showcaseText.classList.contains('in-view')) {
        showcaseText.classList.add('in-view');
      }
      if (scP > 0.1 && showcaseMockup && !showcaseMockup.classList.contains('in-view')) {
        showcaseMockup.classList.add('in-view');
      }

      // Parallax: bg moves slower, mockup drifts subtly
      var scBg = showcaseSection.querySelector('.showcase__bg');
      if (scBg) {
        var bgShift = (current - showcaseSectionTop) * 0.15;
        scBg.style.transform = 'translateY(' + bgShift + 'px)';
      }
    }

    /* 6) Big CTA scale entrance */
    var ctaEl = document.querySelector('[data-cta-scale]');
    if (ctaEl) {
      var ctaTop = getOffsetTop(ctaEl);
      var ctaP = Math.max(0, Math.min(1, (current - (ctaTop - wh)) / (wh * 0.7)));
      var ctaEased = 1 - Math.pow(1 - ctaP, 3);
      var ctaTitle = ctaEl.querySelector('.big-cta__title');
      if (ctaTitle) {
        ctaTitle.style.transform = 'scale(' + (0.7 + 0.3 * ctaEased) + ')';
        ctaTitle.style.opacity = Math.min(1, ctaP * 1.8);
      }
    }

    requestAnimationFrame(smoothScroll);
  }

  /* ---------- Scrub Statement Animation ---------- */
  function animateScrubText() {
    if (!scrubSection || !scrubLines.length) return;
    var sTop = scrubSection.offsetTop;
    var sStart = sTop - wh;
    var sEnd = sTop - wh * 0.2;
    var sp = Math.max(0, Math.min(1, (current - sStart) / (sEnd - sStart)));

    for (var li = 0; li < scrubLines.length; li++) {
      var line = scrubLines[li];
      var lineStart = li * 0.12;

      if (line.classList.contains('scrub-line--gradient')) {
        var lEnd = lineStart + 0.55;
        var lp = Math.max(0, Math.min(1, (sp - lineStart) / (lEnd - lineStart)));
        var eased = 1 - Math.pow(1 - lp, 3);
        line.style.transform = 'translateX(' + (80 * (1 - eased)) + 'px) skewX(' + (-14 * (1 - eased)) + 'deg)';
        line.style.opacity = Math.min(1, lp * 2.5);
      } else {
        var chars = line._chars;
        if (!chars || !chars.length) continue;
        for (var c = 0; c < chars.length; c++) {
          var cStart2 = lineStart + (c / chars.length) * 0.15;
          var cEnd2 = cStart2 + 0.5;
          var cp3 = Math.max(0, Math.min(1, (sp - cStart2) / (cEnd2 - cStart2)));
          var e3 = 1 - Math.pow(1 - cp3, 3);
          chars[c].style.transform = 'translateX(' + (80 * (1 - e3)) + 'px) skewX(' + (-14 * (1 - e3)) + 'deg) scaleY(' + (0.95 + 0.05 * e3) + ')';
          chars[c].style.opacity = Math.min(1, cp3 * 2.5);
        }
      }
    }

    for (var sti = 0; sti < scrubStickers.length; sti++) {
      var sticker = scrubStickers[sti];
      var stDelay = 0.35 + sti * 0.15;
      var stP = Math.max(0, Math.min(1, (sp - stDelay) / 0.4));
      var stE = 1 - Math.pow(1 - stP, 3);
      sticker.style.transform = 'perspective(1000px) rotateY(' + (-40 * (1 - stE)) + 'deg) scale(' + (1.35 - 0.35 * stE) + ')';
      sticker.style.opacity = stE;
    }
  }

  /* ---------- Init scrub text splitting ---------- */
  function initScrubText() {
    var lines = document.querySelectorAll('[data-scrub-line]');
    scrubLines = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.classList.contains('scrub-line--gradient')) {
        line._chars = null;
        scrubLines.push(line);
        continue;
      }
      var text = line.textContent;
      var html = '';
      for (var j = 0; j < text.length; j++) {
        html += text[j] === ' '
          ? '<span class="scrub-char">\u00A0</span>'
          : '<span class="scrub-char">' + text[j] + '</span>';
      }
      line.innerHTML = html;
      line._chars = line.querySelectorAll('.scrub-char');
      scrubLines.push(line);
    }
    scrubStickers = Array.from(document.querySelectorAll('[data-scroll-sticker]'));
  }

  /* ---------- Init Scroll Animations ---------- */
  function initScrollAnimations() {
    /* Scroll-cards with cached section offset */
    scrollCards = [];
    var cardEls = document.querySelectorAll('[data-scroll-card]');
    for (var i = 0; i < cardEls.length; i++) {
      var card = cardEls[i];
      var sec = card.closest('[data-scroll-section]');
      card._sectionTop = sec ? getOffsetTop(sec) : getOffsetTop(card);
      card._idx = parseInt(card.dataset.cardIndex) || 0;
      scrollCards.push(card);
    }

    /* Scroll-slides */
    scrollSlides = [];
    var slideEls = document.querySelectorAll('[data-scroll-slide]');
    for (var s = 0; s < slideEls.length; s++) {
      var slide = slideEls[s];
      var sec2 = slide.closest('[data-scroll-section]');
      slide._sectionTop = sec2 ? getOffsetTop(sec2) : getOffsetTop(slide);
      slide._idx = parseInt(slide.dataset.slideIndex) || 0;
      scrollSlides.push(slide);
    }

    /* Scroll fade-ups */
    scrollFadeUps = [];
    var fadeEls = document.querySelectorAll('.scroll-fade-up');
    for (var f = 0; f < fadeEls.length; f++) {
      fadeEls[f]._top = getOffsetTop(fadeEls[f]);
      scrollFadeUps.push(fadeEls[f]);
    }

    /* Split-word titles */
    splitWordSections = [];
    var splitEls = document.querySelectorAll('[data-split-words]');
    for (var sw = 0; sw < splitEls.length; sw++) {
      var el = splitEls[sw];
      var nodes = el.childNodes;
      var html = '';
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/);
          for (var p = 0; p < parts.length; p++) {
            html += parts[p].trim() === ''
              ? parts[p]
              : '<span class="split-word">' + parts[p] + '</span>';
          }
        } else if (node.nodeType === 1) {
          var inner = node.textContent.split(/(\s+)/);
          var cls = node.className || '';
          for (var q = 0; q < inner.length; q++) {
            html += inner[q].trim() === ''
              ? inner[q]
              : '<span class="split-word ' + cls + '">' + inner[q] + '</span>';
          }
        }
      }
      el.innerHTML = html;
      var wordEls = el.querySelectorAll('.split-word');
      splitWordSections.push({
        el: el,
        words: Array.from(wordEls),
        top: getOffsetTop(el)
      });
    }
  }

  /* ---------- Mouse-driven gradient hue ---------- */
  var mouseX = 0.5, hueTarget = 250, hueCurrent = 250;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX / ww;
  });

  var hueTime = 0;
  function updateGradientHue() {
    // Smooth oscillation between blue (220) and purple (280)
    hueTime += 0.008;
    hueCurrent = 250 + Math.sin(hueTime) * 30; // oscillates 220 ↔ 280
    var gEls = document.querySelectorAll('.gradient-text, .scrub-line--gradient');
    for (var g = 0; g < gEls.length; g++) {
      gEls[g].style.setProperty('--hue', hueCurrent);
    }
  }

  /* ---------- Custom Cursor ---------- */
  var cursor = document.querySelector('.cursor');
  var cursorLabel = document.querySelector('.cursor__label');
  var cx = 0, cy = 0, cxTarget = 0, cyTarget = 0;

  function initCursor() {
    if (!cursor || ww < 769) return;

    document.addEventListener('mousemove', function(e) {
      cxTarget = e.clientX;
      cyTarget = e.clientY;
    });

var hoverables = document.querySelectorAll('a, button, .btn, .work__card-h, .diff__card, .feature, .package-card, .process__step, .nav__toggle, [role="button"]');
  for (var h = 0; h < hoverables.length; h++) {
    (function(el) {
      el.addEventListener('mouseenter', function() {
        document.body.classList.add('cursor-hover');
        if (cursorLabel) {
          cursorLabel.textContent = el.dataset.cursorText || 'Click!';
            document.body.classList.add('cursor-text');
          }
        });
        el.addEventListener('mouseleave', function() {
          document.body.classList.remove('cursor-hover', 'cursor-text');
          if (cursorLabel) cursorLabel.textContent = '';
        });
      })(hoverables[h]);
    }

    function animateCursor() {
      cx = lerp(cx, cxTarget, 0.15);
      cy = lerp(cy, cyTarget, 0.15);
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ---------- Starfield ---------- */
  var stars = [];
  var STAR_COUNT = 350;

  function initStarfield() {
    if (!starCanvas || !ctx) return;
    resizeCanvas();
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * ww, y: Math.random() * wh,
        r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.5 + 0.1,
        s: Math.random() * 0.5 + 0.1, d: Math.random() * Math.PI * 2
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
    var time = Date.now() * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = 0.3 + 0.7 * Math.sin(time * s.s * 1.4 + s.d);
      var pulse = s.r * (0.85 + 0.15 * Math.sin(time * s.s * 2 + s.d));
      ctx.beginPath();
      ctx.arc(s.x, s.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,200,255,' + (s.a * tw) + ')';
      ctx.fill();
    }
    requestAnimationFrame(animateStars);
  }

  /* ---------- Reveals (.reveal class, hero lines) ---------- */
  function initReveals() {
    var reveals = document.querySelectorAll('.reveal');
    var lines = document.querySelectorAll('[data-lines]');

    var revealObs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var d = parseInt(entries[i].target.dataset.delay) || 0;
          (function(t) { setTimeout(function() { t.classList.add('visible'); }, d); })(entries[i].target);
          revealObs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.15 });
    for (var r = 0; r < reveals.length; r++) revealObs.observe(reveals[r]);

    var lineObs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('lines-visible');
          lineObs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.15 });
    for (var l = 0; l < lines.length; l++) lineObs.observe(lines[l]);

    if (hero) setTimeout(function() { hero.classList.add('is-active'); }, 800);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    if (!nav) return;
    window.addEventListener('scroll', function() {
      if (target > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });

    var toggle = nav.querySelector('.nav__toggle');
    var links = nav.querySelector('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });
      var navAs = links.querySelectorAll('a');
      for (var i = 0; i < navAs.length; i++) {
        navAs[i].addEventListener('click', function() {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      }
    }
  }

  /* ---------- Smooth Anchors ---------- */
  function initAnchors() {
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function(e) {
        e.preventDefault();
        var id = this.getAttribute('href');
        if (id === '#') return;
        var el = document.querySelector(id);
        if (!el) return;
        var top = el.offsetTop;
        window.scrollTo({ top: top, behavior: 'auto' });
        target = top;
      });
    }
  }

  /* ---------- Text Scramble ---------- */
  var CHARS = '{}/<>01!@#$%^&*()_+~`|\\:;"\',.?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  function scramble(el) {
    var original = el.dataset.text || el.textContent;
    if (!el.dataset.text) el.dataset.text = original;
    var len = original.length;
    var frame = 0;
    var totalFrames = 30;

    function step() {
      var out = '';
      for (var i = 0; i < len; i++) {
        if (original[i] === ' ') { out += ' '; continue; }
        out += frame > (i / len) * totalFrames
          ? original[i]
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(step);
      else el.textContent = original;
    }
    el.classList.add('scrambling');
    step();
    setTimeout(function() { el.classList.remove('scrambling'); }, totalFrames * 30);
  }

  function initScramble() {
    var targets = document.querySelectorAll(
      '.nav__links a:not(.nav__cta), .footer__nav a, .tag, .work__cat, .diff__num, .process__num, .package__tier, .footer__social a'
    );
    for (var i = 0; i < targets.length; i++) {
      (function(t) {
        t.addEventListener('mouseenter', function() { scramble(t); });
      })(targets[i]);
    }
  }

  /* ---------- Contact Form ---------- */
  function initForm() {
    var form = document.querySelector('.contact__form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('.btn');
      if (btn) {
        btn.textContent = 'Message Sent';
        btn.style.background = '#00b894';
      }
      setTimeout(function() {
        form.reset();
        if (btn) {
          btn.innerHTML = 'Send Message <span class="btn__arrow">&rarr;</span>';
          btn.style.background = '';
        }
      }, 3000);
    });
  }

  /* ---------- Card Deck (Packages) ---------- */
  var deckCards = [];
  var deckActiveIndex = 1; // Start on Growth (middle card)
  var deckDots = [];
  var deckDragging = false;
  var deckStartX = 0;
  var deckDelta = 0;

  function setDeckPositions() {
    var total = deckCards.length;
    for (var i = 0; i < total; i++) {
      var offset = i - deckActiveIndex;
      var pos;
      if (offset === 0) pos = 'center';
      else if (offset === -1) pos = 'left';
      else if (offset === 1) pos = 'right';
      else if (offset < -1) pos = 'far-left';
      else pos = 'far-right';
      deckCards[i].setAttribute('data-position', pos);
    }
    for (var d = 0; d < deckDots.length; d++) {
      deckDots[d].classList.toggle('active', d === deckActiveIndex);
    }
  }

  function deckNext() {
    if (deckActiveIndex < deckCards.length - 1) {
      deckActiveIndex++;
      setDeckPositions();
    }
  }

  function deckPrev() {
    if (deckActiveIndex > 0) {
      deckActiveIndex--;
      setDeckPositions();
    }
  }

  function deckGoTo(idx) {
    deckActiveIndex = Math.max(0, Math.min(deckCards.length - 1, idx));
    setDeckPositions();
  }

  function initCardDeck() {
    var deck = document.getElementById('packagesDeck');
    if (!deck) return;

    deckCards = Array.from(deck.querySelectorAll('.package-card'));
    deckDots = Array.from(deck.querySelectorAll('.deck-dot'));

    var prevBtn = deck.querySelector('.deck-nav__prev');
    var nextBtn = deck.querySelector('.deck-nav__next');

    if (prevBtn) prevBtn.addEventListener('click', deckPrev);
    if (nextBtn) nextBtn.addEventListener('click', deckNext);

    for (var d = 0; d < deckDots.length; d++) {
      (function(idx) {
        deckDots[idx].addEventListener('click', function() { deckGoTo(idx); });
      })(d);
    }

    // Click left/right cards to navigate
    for (var c = 0; c < deckCards.length; c++) {
      (function(idx) {
        deckCards[idx].addEventListener('click', function() {
          if (idx !== deckActiveIndex) deckGoTo(idx);
        });
      })(c);
    }

    // Click-and-drag to swipe through cards
    var cardsEl = deck.querySelector('.packages-deck__cards');
    if (cardsEl) {
      cardsEl.style.touchAction = 'pan-y';
      cardsEl.addEventListener('mousedown', function(e) {
        if (e.target.closest('a, button')) return;
        e.preventDefault();
        deckDragging = true;
        deckStartX = e.clientX;
        deckDelta = 0;
        cardsEl.style.cursor = 'grabbing';
      });
      document.addEventListener('mousemove', function(e) {
        if (!deckDragging) return;
        e.preventDefault();
        deckDelta = e.clientX - deckStartX;
      });
      document.addEventListener('mouseup', function() {
        if (!deckDragging) return;
        deckDragging = false;
        cardsEl.style.cursor = '';
        if (deckDelta < -50) deckNext();
        else if (deckDelta > 50) deckPrev();
      });

      // Touch swipe support
      cardsEl.addEventListener('touchstart', function(e) {
        if (e.target.closest('a, button')) return;
        deckDragging = true;
        deckStartX = e.touches[0].clientX;
        deckDelta = 0;
      }, { passive: true });
      cardsEl.addEventListener('touchmove', function(e) {
        if (!deckDragging) return;
        deckDelta = e.touches[0].clientX - deckStartX;
      }, { passive: true });
      cardsEl.addEventListener('touchend', function() {
        if (!deckDragging) return;
        deckDragging = false;
        if (deckDelta < -50) deckNext();
        else if (deckDelta > 50) deckPrev();
      });
    }

    setDeckPositions();
  }

  /* ---------- Portfolio Glow Tracking ---------- */
  function initPortfolioGlow() {
    var rows = document.querySelectorAll('[data-portfolio-row]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('mousemove', function(e) {
        var rect = this.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        this.style.setProperty('--glow-x', x + '%');
        this.style.setProperty('--glow-y', y + '%');
      });
    }
  }

  /* ---------- Showcase Init + Card Flipper ---------- */
  var showcaseCards = [];
  var showcaseRocket = null;
  var showcaseActiveIdx = 0;
  var showcaseCycleTimer = null;

  function initShowcase() {
    showcaseSection = document.querySelector('.showcase');
    if (!showcaseSection) return;
    showcaseText = showcaseSection.querySelector('[data-showcase-text]');
    showcaseMockup = showcaseSection.querySelector('[data-showcase-mockup]');
    showcaseSectionTop = getOffsetTop(showcaseSection);

    showcaseCards = Array.from(showcaseSection.querySelectorAll('[data-showcase-card]'));
    showcaseRocket = showcaseSection.querySelector('.showcase__rocket');
    if (showcaseCards.length === 0) return;

    // Set first card active
    showcaseCards[0].classList.add('card-active');
    showcaseActiveIdx = 0;

    // Start cycling once mockup is in view
    startShowcaseCycle();
  }

  function startShowcaseCycle() {
    if (showcaseCycleTimer) return;
    showcaseCycleTimer = setInterval(function() {
      // Only cycle if the mockup is in view
      if (!showcaseMockup || !showcaseMockup.classList.contains('in-view')) return;
      cycleShowcaseCard();
    }, 3000);
  }

  function cycleShowcaseCard() {
    var currentCard = showcaseCards[showcaseActiveIdx];
    var nextIdx = (showcaseActiveIdx + 1) % showcaseCards.length;
    var nextCard = showcaseCards[nextIdx];

    // 1) Fire rocket
    if (showcaseRocket) {
      showcaseRocket.classList.remove('fly');
      void showcaseRocket.offsetWidth;
      showcaseRocket.classList.add('fly');
    }

    // 2) Hide current card as rocket passes over it (~40% through)
    setTimeout(function() {
      currentCard.classList.remove('card-active');
      currentCard.classList.add('card-exit');
    }, 320);

    // 3) Show next card after rocket clears (~70% through)
    setTimeout(function() {
      nextCard.classList.remove('card-exit');
      nextCard.classList.add('card-active');
      showcaseActiveIdx = nextIdx;
    }, 580);

    // 4) Clean up exit class
    setTimeout(function() {
      currentCard.classList.remove('card-exit');
    }, 900);
  }

  /* ---------- Init ---------- */
  function initAfterLoad() {
    parallaxEls = Array.from(document.querySelectorAll('[data-speed]'));
    setBodyHeight();
    initScrubText();
    initScrollAnimations();
    initCardDeck();
    initPortfolioGlow();
    initShowcase();
    smoothScroll();
    initStarfield();
    initCursor();

  /* ---------- Auto-Glitch on .tag elements ---------- */
  var tags = document.querySelectorAll('.tag');
  function scheduleGlitch(el) {
    var delay = 3000 + Math.random() * 5000;
    setTimeout(function() {
      if (!el.classList.contains('glitching')) {
        el.classList.add('glitching');
        setTimeout(function() { el.classList.remove('glitching'); }, 400);
      }
      scheduleGlitch(el);
    }, delay);
  }
  for (var g = 0; g < tags.length; g++) {
    scheduleGlitch(tags[g]);
  }
    initReveals();
    initNav();
    initAnchors();
    initScramble();
    initForm();
  }

  /* ---------- Resize ---------- */
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      wh = window.innerHeight;
      ww = window.innerWidth;
      setBodyHeight();
      resizeCanvas();
      // Recache offsets
      for (var i = 0; i < scrollFadeUps.length; i++) scrollFadeUps[i]._top = getOffsetTop(scrollFadeUps[i]);
      for (var j = 0; j < scrollCards.length; j++) {
        var sec = scrollCards[j].closest('[data-scroll-section]');
        scrollCards[j]._sectionTop = sec ? getOffsetTop(sec) : getOffsetTop(scrollCards[j]);
      }
      for (var k = 0; k < scrollSlides.length; k++) {
        var sec2 = scrollSlides[k].closest('[data-scroll-section]');
        scrollSlides[k]._sectionTop = sec2 ? getOffsetTop(sec2) : getOffsetTop(scrollSlides[k]);
      }
      for (var m = 0; m < splitWordSections.length; m++) {
        splitWordSections[m].top = getOffsetTop(splitWordSections[m].el);
      }
      // Recalculate showcase
      if (showcaseSection) {
        showcaseSectionTop = getOffsetTop(showcaseSection);
      }
    }, 150);
  });
})();
