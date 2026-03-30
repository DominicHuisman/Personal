/* ============================================
   NEXUS DIGITAL — IMMERSIVE SCROLL ENGINE
   ============================================ */

(function () {
  'use strict';

  /* ----------------------------------------
     PRELOADER
     ---------------------------------------- */
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloaderFill');
  let loadProgress = 0;

  function animatePreloader() {
    loadProgress += (100 - loadProgress) * 0.08;
    preloaderFill.style.width = loadProgress + '%';

    if (loadProgress < 95) {
      requestAnimationFrame(animatePreloader);
    }
  }

  animatePreloader();

  window.addEventListener('load', () => {
    loadProgress = 100;
    preloaderFill.style.width = '100%';

    setTimeout(() => {
      preloader.classList.add('done');
      document.body.style.overflow = '';
      initEverything();
    }, 600);
  });

  document.body.style.overflow = 'hidden';


  /* ----------------------------------------
     STARFIELD
     ---------------------------------------- */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let starAnimId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 5000), 350);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.2 + 0.03,
        drift: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
        pulseRate: Math.random() * 0.008 + 0.003,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ambient gradient
    const g = ctx.createRadialGradient(
      canvas.width * 0.25, canvas.height * 0.25, 0,
      canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.7
    );
    g.addColorStop(0, 'rgba(108,92,231,0.015)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.y -= s.speed;
      s.x += s.drift;
      s.phase += s.pulseRate;

      if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      if (s.x < -2) s.x = canvas.width + 2;
      if (s.x > canvas.width + 2) s.x = -2;

      const flicker = Math.sin(s.phase) * 0.25 + 0.75;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,190,230,${s.a * flicker})`;
      ctx.fill();
    }

    starAnimId = requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  createStars();
  drawStars();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(starAnimId);
    resizeCanvas();
    createStars();
    drawStars();
  });


  /* ----------------------------------------
     CUSTOM CURSOR
     ---------------------------------------- */
  const cursor = document.getElementById('cursor');
  const cursorLabel = document.getElementById('cursorLabel');
  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  const isTouch = 'ontouchstart' in window;

  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effects
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor-text]');
      if (!target) {
        document.body.classList.remove('cursor-hover', 'cursor-text');
        cursorLabel.textContent = '';
        return;
      }

      const label = target.getAttribute('data-cursor-text');
      if (label) {
        document.body.classList.add('cursor-text');
        cursorLabel.textContent = label;
      } else {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor-text]');
      if (target) {
        document.body.classList.remove('cursor-hover', 'cursor-text');
        cursorLabel.textContent = '';
      }
    });
  } else {
    cursor.style.display = 'none';
  }


  /* ----------------------------------------
     MAIN INIT
     ---------------------------------------- */
  function initEverything() {
    initIntroSequence();
    initNavigation();
    initRevealAnimations();
    initHeroParallax();
    initHorizontalScroll();
    initContactForm();
    initSmoothAnchors();
  }


  /* ----------------------------------------
     INTRO SEQUENCE — Roswell-style
     ---------------------------------------- */
  function initIntroSequence() {
    const intro = document.getElementById('intro');
    const frames = intro.querySelectorAll('.intro__frame');
    const nav = document.getElementById('nav');
    const totalFrames = frames.length;

    function updateIntro() {
      const rect = intro.getBoundingClientRect();
      const scrollHeight = intro.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollHeight));

      // Divide progress into segments for each frame
      const segmentSize = 1 / totalFrames;

      frames.forEach((frame, i) => {
        const segStart = i * segmentSize;
        const segEnd = segStart + segmentSize;
        const segMid = segStart + segmentSize * 0.5;

        let opacity = 0;
        let scale = 0.95;
        let y = 20;

        if (progress >= segStart && progress <= segEnd) {
          // Fade in during first half, fade out during second half
          const segProgress = (progress - segStart) / segmentSize;

          if (segProgress < 0.15) {
            // Fade in
            const t = segProgress / 0.15;
            opacity = t;
            scale = 0.96 + t * 0.04;
            y = 20 * (1 - t);
          } else if (segProgress < 0.7) {
            // Hold
            opacity = 1;
            scale = 1;
            y = 0;
          } else {
            // Fade out
            const t = (segProgress - 0.7) / 0.3;
            opacity = 1 - t;
            scale = 1 + t * 0.03;
            y = -15 * t;
          }
        }

        frame.style.opacity = opacity;
        frame.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      });

      // Show nav after intro
      if (progress > 0.95) {
        nav.classList.add('visible');
      } else {
        nav.classList.remove('visible');
      }

      requestAnimationFrame(updateIntro);
    }

    requestAnimationFrame(updateIntro);
  }


  /* ----------------------------------------
     NAVIGATION
     ---------------------------------------- */
  function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
      const introBottom = document.getElementById('intro').getBoundingClientRect().bottom;
      nav.classList.toggle('scrolled', introBottom < 0 && window.scrollY > 100);
    }, { passive: true });

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ----------------------------------------
     REVEAL ANIMATIONS
     ---------------------------------------- */
  function initRevealAnimations() {
    const els = document.querySelectorAll('.reveal-up');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal-up'));
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 120, 500);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    els.forEach(el => observer.observe(el));

    // Hero line reveals
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.closest('.hero__title-wrap').classList.add('lines-visible');

            // Also reveal sub and ctas
            setTimeout(() => {
              const sub = document.querySelector('.hero__sub');
              const ctas = document.querySelector('.hero__ctas');
              if (sub) sub.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s';
              if (ctas) ctas.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s';
            }, 100);

            heroObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      heroObserver.observe(heroTitle);

      // Init hidden state
      const sub = document.querySelector('.hero__sub');
      const ctas = document.querySelector('.hero__ctas');
      if (sub) sub.style.cssText = 'opacity:0;transform:translateY(30px)';
      if (ctas) ctas.style.cssText = 'opacity:0;transform:translateY(30px)';
    }

    // Big CTA line reveals
    const bigCtaTitle = document.querySelector('.big-cta__title');
    if (bigCtaTitle) {
      const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lines-visible');
            ctaObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      ctaObserver.observe(bigCtaTitle);
    }
  }


  /* ----------------------------------------
     HERO PARALLAX
     ---------------------------------------- */
  function initHeroParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');

    function updateParallax() {
      const scrollY = window.scrollY;
      const heroH = window.innerHeight;

      if (scrollY < heroH * 2) {
        parallaxEls.forEach(el => {
          const rate = parseFloat(el.getAttribute('data-parallax'));
          const y = scrollY * rate;
          el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
      }

      requestAnimationFrame(updateParallax);
    }

    updateParallax();
  }


  /* ----------------------------------------
     HORIZONTAL SCROLL (Work section)
     ---------------------------------------- */
  function initHorizontalScroll() {
    const section = document.getElementById('work');
    const horizontal = document.getElementById('workHorizontal');
    const track = document.getElementById('workTrack');

    if (!section || !horizontal || !track) return;

    function updateHorizontalScroll() {
      const rect = horizontal.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      // Calculate how much horizontal scroll space we need
      const trackWidth = track.scrollWidth;
      const viewWidth = window.innerWidth;
      const scrollDistance = trackWidth - viewWidth + 100;

      // Progress through the work section
      const sectionHeight = section.offsetHeight;
      const sectionScrolled = -sectionRect.top;
      const headerHeight = 300; // rough height of the title area
      const effectiveScroll = sectionScrolled - headerHeight;
      const scrollRange = sectionHeight - window.innerHeight - headerHeight;
      const progress = Math.max(0, Math.min(1, effectiveScroll / scrollRange));

      // Apply horizontal scroll
      const x = -progress * scrollDistance;
      track.style.transform = `translate3d(${x}px, 0, 0)`;

      requestAnimationFrame(updateHorizontalScroll);
    }

    // Set appropriate margin/height for scroll room
    const trackWidth = track.scrollWidth;
    const viewWidth = window.innerWidth;
    const ratio = trackWidth / viewWidth;
    section.style.marginBottom = Math.max(ratio * 100, 150) + 'vh';

    requestAnimationFrame(updateHorizontalScroll);
  }


  /* ----------------------------------------
     SMOOTH ANCHOR SCROLLING
     ---------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const navH = document.getElementById('nav').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ----------------------------------------
     CONTACT FORM
     ---------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const origHTML = btn.innerHTML;

      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      setTimeout(() => {
        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = '#00b894';
        btn.style.boxShadow = '0 0 30px rgba(0,184,148,0.3)';
        form.reset();

        setTimeout(() => {
          btn.innerHTML = origHTML;
          btn.disabled = false;
          btn.style.opacity = '';
          btn.style.background = '';
          btn.style.boxShadow = '';
        }, 3000);
      }, 1500);
    });
  }

})();
